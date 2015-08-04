module.exports = function *(next) {
  var book = yield this.service.find.bookBySlug(this.params.slug);
  var exists = book && this.params.year === book.year && this.params.rank === book.rank;
  this.assert(exists, 404, 'Book not found');
  var nextBook = yield this.service.selectedBook.nextBook(book);
  var relatedBooks = yield this.service.selectedBook.relatedBooks(book);
  yield this.render('book', {
    book: book,
    nextBook: nextBook,
    relatedBooks: relatedBooks
  });
  yield next;
};
