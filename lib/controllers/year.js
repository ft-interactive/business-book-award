var service = require('../service');

module.exports = function *(year) {
  var books = service().find.booksByYear(year);
  var exists = !!books.length;

  if (!exists) {
    this.throw(404);
    return;
  }

  yield this.render('home', {
    title: year,
    books: books
  });
};
