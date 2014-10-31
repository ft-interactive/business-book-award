exports.list = function*(next) {
  this.body = yield this.service.find.allBooksGroupedByYear();
  yield next;
};

exports.view = function*(next) {
  this.body = yield this.service.find.booksByYear(this.params.year);
  yield next;
};
