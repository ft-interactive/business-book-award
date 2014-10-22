var fs = require('fs');
var dsv = require("dsv");

var csv = dsv(",");
var str = fs.readFileSync(__dirname + '/data.csv').toString();
var data = csv.parse(str);

var genres = {};
var years = {};
var books = {}

data.forEach(function (row){
  if (!row || !row.year || !row.title || !row.author) return;
  row.year = (row.year || '').toString().trim();
  if (!row.year) return;
  if (!years[row.year]) {
    years[row.year] = [];
  }
  years[row.year].push(row);
  row.author = row.author.trim();
  row.title = row.title.trim();
  row.slug = (row.title.toLowerCase() + '-by-' + row.author.toLowerCase().replace(/\,\ */g, '+')).replace(/\ +/g, '-').replace(/\&/g, '+').replace(/\'/g, '');
  books[row.slug] = row;
  var list = (row.genre || '').split(/,\s*/g);
  row.genres = [];
  list.forEach(function (d) {
    d = d.trim();
    if (!genres[d]) {
      genres[d] = [];
    }
    genres[d].push(row);
    row.genres.push(d);
  });
  delete row.genre;
});

exports.genres = genres;
exports.years = years;
exports.books = books;

exports.data = data;

console.log(genres);
function findBookBySlug(slug) {
  return books[slug];
}

function findBooksByYear(year) {
  return years[year] || [];
}

function findAllBooksGroupedByYear() {
  return data;
}

function findBooksByGenreName(name) {
  return genres[name] || [];
}

module.exports = function() {
  return {
    find: {
      bookBySlug: findBookBySlug,
      booksByYear: findBooksByYear,
      allBooksGroupedByYear: findAllBooksGroupedByYear,
      booksByGenreName: findBooksByGenreName
    }
  }
};
