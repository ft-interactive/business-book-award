module.exports = function *(year, rank, slug) {
  var book = this.app.service().find.bookBySlug(slug);
  var exists = book && year === book.year && rank === book.rank;

  if (!exists) {
    this.throw(404);
    return;
  }

  yield this.render('book', book);
};
