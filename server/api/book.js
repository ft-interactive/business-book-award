exports.list = function*(next) {
  this.body = yield this.service.find.allBooks();
  yield next;
};

exports.view = function*(next) {
  this.body = yield this.service.find.bookBySlug(this.params.slug);
  yield next;
};
