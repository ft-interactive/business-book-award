module.exports = function *(name) {
  var books = this.app.service().find.booksByGenreName(name);
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
