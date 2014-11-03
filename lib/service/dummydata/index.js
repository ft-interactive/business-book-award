var fs = require('fs');
var dsv = require("dsv");
var thunkify = require('thunkify');
var _ = require('lodash');
var getSlug = require('speakingurl');

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

function sortBySlug(a, b) {
  return a.slug.toString().localeCompare(b.slug.toString());
}

function sortByRank(a, b) {
  return ranks[a.rank] > ranks[b.rank];
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
  row.cover = !row.cover ? null : ('http://interactivegraphics.ft-static.com/static/sites/2014/business-books-of-the-decade/covers/' + row.cover);
  row.synopsis = !row.synopsis ? null : ('http://interactivegraphics.ft-static.com/static/sites/2014/business-books-of-the-decade/synopses' + row.synopsis);
  row.slug = getSlug(row.title + ' by ' + row.author.replace(/\,\ */g, '&').replace(/\'/, ''));

  books[row.slug] = row;
  var list = Array.isArray(row.category) ? row.category : (row.category || '').split(/,\s*/g);
  row.categories = [];
  list.forEach(function (d) {
    var name = d.trim();
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

var categoriesArray = _.toArray(categories);
categoriesArray.sort(sortBySlug);

categoriesArray.forEach(function (category) {
  category.books.sort(sortByRank).reverse();
});

var yearsArray = _.toArray(years);
yearsArray.sort(sortBySlug).reverse();

yearsArray.forEach(function (year) {
  year.books.sort(sortByRank).reverse();
});

winners.sort().reverse();

function findBookBySlug(slug, callback) {
  setTimeout(function() {
    callback(null, books[slug]);
  }, 80);
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
    categroy = _.cloneDeep(category);
    category.books = category.books.filter(function (book) {
      var dupe = got[book.slug] || book.slug === selectedBook.slug;
      if (!dupe) got[book.slug] = true;
      return !dupe;
    }).sort(sortByRank).reverse();
    c.push(category);
  });
  c.sort(function(a, b){
    return a.books.length < b.books.length;
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
      winners: thunkify(findWinners)
    },
    selectedBook: {
      nextBook: thunkify(nextBook),
      relatedBooks: thunkify(relatedBooks)
    }
  }
};
