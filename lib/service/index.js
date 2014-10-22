var dummydata = require('./dummydata');

function findBookBySlug(slug) {
  return dummydata.books[slug];
}

function findBooksByYear(year) {
  return dummydata.years[year];
}

function findAllBooksGroupedByYear() {
  return dummydata.data;
}

function findBooksByGenreName(name) {
  return dummydata.genres[name];
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
