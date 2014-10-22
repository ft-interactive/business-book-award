module.exports = function *(year) {
  var books = this.app.service().find.booksByYear(year);
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
