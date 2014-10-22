var service = require('../service');

module.exports = function *(year, rank, slug) {
  var book = service().find.bookBySlug(slug);
  var exists = book && year === book.year && rank === book.slug;

  if (!exists) {
    this.throw(404);
    return;
  }

  yield this.render('book', book);
};
