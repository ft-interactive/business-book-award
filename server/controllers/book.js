const image_service = require('../util/filters').image_service;

module.exports = function *(next) {
  var book = yield this.service.find.bookBySlug(this.params.slug);
  var exists = book && this.params.year === book.year;
  this.assert(exists, 404, 'Book not found');

  // Old links will still exist that have incorrect rank.
  // e.g. a longlisted book will become shortlisted then the winner.
  if (this.params.rank !== book.rank) {
    this.status = 301;
    this.redirect(this.app.url('book', book));
    yield next;
  };

  var nextBook = yield this.service.selectedBook.nextBook(book);
  var relatedBooks = yield this.service.selectedBook.relatedBooks(book);

  this.locals.page.social.image = image_service(book.cover, 300);

  yield this.render('book', {
    book: book,
    nextBook: nextBook,
    relatedBooks: relatedBooks
  });

  yield next;
};
