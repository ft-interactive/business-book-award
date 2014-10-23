module.exports = function *(year, rank, slug) {
  var book = yield this.service.find.bookBySlug(slug);
  var exists = book && year === book.year && rank === book.rank;
  this.assert(exists, 404, 'Book not found');
  yield this.render('book', {
    book: book
  });
};
