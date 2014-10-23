var fs = require('fs');
var dsv = require("dsv");
var thunkify = require('thunkify');

var csv = dsv(",");
var str = fs.readFileSync(__dirname + '/data.csv').toString();
var data = csv.parse(str);

var categories = {};
var years = {};
var books = {}

data.forEach(function (row){
  if (!row || !row.year || !row.title || !row.author) return;
  row.year = (row.year || '').toString().trim();
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
  row.slug = (row.title.toLowerCase() + '-by-' + row.author.toLowerCase().replace(/\,\ */g, '+')).replace(/\ *\&\ */g, '+').replace(/\ +/g, '-').replace(/\'/g, '');
  books[row.slug] = row;
  var list = Array.isArray(row.category) ? row.category : (row.category || '').split(/,\s*/g);
  row.categories = [];
  list.forEach(function (d) {
    var name = d.trim();
    var slug = name.replace(/\ *\&\ */g, '+').replace(/\ +/g, '-');
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
  delete row.category;
});

exports.categories = categories;
exports.years = years;
exports.books = books;

exports.data = data;

function findBookBySlug(slug, callback) {
  setTimeout(function() {
    callback(null, books[slug]);
  }, 80);
}

function findBooksByYear(year, callback) {
  setTimeout(function() {
    callback(null, years[year] || []);
  }, 80);
}

function findAllBooksGroupedByYear(callback) {
  setTimeout(function() {
    callback(null, data);
  }, 80);
}

function findBooksByCategoryName(name, callback) {
  setTimeout(function() {
    callback(null, categories[name] || []);
  }, 80);
}

module.exports = function() {
  return {
    find: {
      bookBySlug: thunkify(findBookBySlug),
      booksByYear: thunkify(findBooksByYear),
      allBooksGroupedByYear: thunkify(findAllBooksGroupedByYear),
      booksByCategoryName: thunkify(findBooksByCategoryName)
    }
  }
};
