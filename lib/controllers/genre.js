var service = require('../service');

module.exports = function *(name) {
  var books = service().find.booksByGenreName(name);
  var exists = !!books.length;

  if (!exists) {
    this.throw(404);
    return;
  }

  yield this.render('home', {
    title: name,
    books: books
  });
};
