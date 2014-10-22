var dummydata = require('./dummydata');

function findBookBySlug(slug) {
  return null;
}

function findBooksByYear(year) {
  return [];
}

function findAllBooksGroupedByYear() {
  return [];
}

function findBooksByGenreName(name) {
  return [];
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
