var fs = require('fs');
var dsv = require("dsv");
var thunkify = require('thunkify');
var _ = require('lodash');
var getSlug = require('speakingurl');
var Remarkable = require('remarkable');
var request = require('co-request');
var co = require('co');
var LRU = require('lru-cache');

var csv = dsv(",");
var str = fs.readFileSync(__dirname + '/data.csv').toString();
var data = csv.parse(str);

var ranks = {
  winner: 100,
  shortlist: 10,
  longlist: 1
};

var categories = {};
var years = {};
var books = {};
var winners = [];

var md = new Remarkable({
  html: false,
  linkify: true
});

var synopsisErrorCache = LRU({
  maxAge: 1000 * 60 * 5
});


function sortBySlug(a, b) {
  return a.slug.toString().localeCompare(b.slug.toString());
}

function sortByRank(a, b) {
  var aR = ranks[a.rank];
  var bR = ranks[b.rank];
  return bR < aR ? -1 : bR > aR ? 1 : sortByYear(a, b);
}

function sortByYear(a, b) {
  var aY = a.year;
  var bY = b.year;
  return bY < aY ? -1 : bY > aY ? 1 : sortBySlug(a, b);
}

function titlecase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

data.forEach(function (row){
  if (!row || !row.year || !row.title || !row.author) return;
  row.year = Number((row.year || '').toString().trim());
  if (!row.year) return;
  if (!years[row.year]) {
    years[row.year] = {
      slug: row.year,
      name: row.year,
      books: []
    };
  }

  years[row.year].books.push(row);
  row.author = row.author.trim();
  row.title = row.title.trim();
  row.rank = row.rank.toLowerCase().trim();
  if (row.rank === 'winner') {
    winners.push(row);
  }
  row.cover = !row.cover ? null : ('http://interactive.ftdata.co.uk/static/sites/2014/business-books-of-the-decade/covers/' + row.cover);
  row.synopsis = !row.synopsis ? null : ('http://interactive.ftdata.co.uk/static/sites/2014/business-books-of-the-decade/synopses/' + row.synopsis);
  row.slug = getSlug(row.title + ' by ' + row.author.replace(/\,\ */g, '&').replace(/\'/, ''));

  books[row.slug] = row;
  var list = Array.isArray(row.category) ? row.category : (row.category || '').split(/,\s*/g);
  row.categories = [];
  list.forEach(function (d) {
    var name = titlecase(d.trim());
    var slug = getSlug(name);

    if (!slug) return;
    if (!categories[slug]) {
      categories[slug] = {
        slug: slug,
        name: name,
        books: []
      };
    }
    row.categories.push({name: name, slug: slug});
    categories[slug].books.push(row);
  });

  row.categories.sort(sortBySlug);

  delete row.category;
});

_.forEach(categories, function (category) {
  category.books.sort(sortByRank);
});

var categoriesArray = _.toArray(categories);
categoriesArray.sort(sortBySlug);

categoriesArray.forEach(function (category) {
  category.books.sort(sortByRank);
});

_.forEach(years, function (year) {
  year.books.sort(sortByRank);
});

var yearsArray = _.toArray(years);
yearsArray.sort(sortByYear).reverse();

yearsArray.forEach(function (year) {
  year.books.sort(sortByRank);
});

var allBooks = yearsArray.reduce(function(arr, a) {
  return arr.concat(a.books);
}, []);

winners.sort(sortByYear);

function findBookBySlug(slug, callback) {
  co(function*(){
    var book = books[slug];

    if (!book) {
      callback(null, null);
      return;
    }

    if (book.synopsisHTML || synopsisErrorCache.has(slug)) {
      callback(null, book);
      return;
    }

    var res = yield request(book.synopsis);
    if (res.statusCode !== 200) {
      synopsisErrorCache.set(slug, slug);
    } else {
      book.synopsisHTML = md.render(res.body);
    }
    callback(null, book);
  })();
}

function findAllBooks(callback) {
  setTimeout(function() {
    callback(null, allBooks);
  }, 1);
}

function findBooksByYear(year, callback) {
  setTimeout(function() {
    callback(null, years[year] || null);
  }, 1);
}

function findAllBooksGroupedByYear(callback) {
  setTimeout(function() {
    callback(null, yearsArray);
  }, 1);
}

function findBooksForMostRecentYear(callback) {
  setTimeout(function() {
    callback(null, yearsArray[0]);
  }, 1);
}

function findBooksByCategoryName(name, callback) {
  setTimeout(function() {
    callback(null, categories[name] || null);
  }, 1);
}

function findAllCategories(callback) {
  setTimeout(function() {
    callback(null, categoriesArray);
  }, 1);
}

function nextBook(selectedBook, callback) {
  setTimeout(function() {
    findBooksByYear(selectedBook.year, function(err, year) {
      var index = _.findIndex(year.books, {slug: selectedBook.slug});
      var isLast = index >= year.books.length - 1;
      var nextIndex = isLast ? 0 : index + 1;
      callback(null, year.books[nextIndex]);
    });
  }, 2);
}

function relatedBooks(selectedBook, callback) {
  var slugs = _.pluck(selectedBook.categories, 'slug');
  var c = [];
  var got = {};

  slugs.forEach(function (slug) {
    var category = categories[slug];
    var clone = _.cloneDeep(category);

    // remove selected book and reorder the results
    // so that the books after the selected book appear first
    var selectedIndex = _.findIndex(category.books, {slug: selectedBook.slug});

    if (selectedIndex !== -1) {
      clone.books = category.books.slice(selectedIndex + 1).concat(category.books.slice(0, selectedIndex));
    }

    //remove duplicates across all the category lists.
    clone.books = clone.books.filter(function (book) {
      var dupe = got[book.slug];
      if (!dupe) got[book.slug] = true;
      return !dupe;
    });

    c.push(clone);
  });
  c.sort(function (a, b) {
    var aL = a.books.length;
    var bL = b.books.length;
    return bL < aL ? -1 : bL > aL ? 1 : 0;
  })
  setTimeout(function() {
    callback(null, c);
  }, 2);
}

function findWinners(callback) {
  setTimeout(function() {
    callback(null, winners);
  }, 1);
}

module.exports = function() {
  return {
    find: {
      bookBySlug: thunkify(findBookBySlug),
      booksByYear: thunkify(findBooksByYear),
      allBooksGroupedByYear: thunkify(findAllBooksGroupedByYear),
      booksByCategoryName: thunkify(findBooksByCategoryName),
      allCategories: thunkify(findAllCategories),
      allBooks: thunkify(findAllBooks),
      winners: thunkify(findWinners)
    },
    selectedBook: {
      nextBook: thunkify(nextBook),
      relatedBooks: thunkify(relatedBooks)
    }
  }
};
