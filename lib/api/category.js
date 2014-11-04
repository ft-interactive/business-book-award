var _ = require('lodash');

exports.list = function*(next) {
  this.body = yield this.service.find.allCategories();
  yield next;
};

exports.view = function*(next) {
  this.body = yield this.service.find.booksByCategoryName(this.params.slug);
  yield next;
};
