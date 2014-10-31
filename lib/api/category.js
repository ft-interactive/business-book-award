var _ = require('lodash');

exports.list = function*(next) {
  var categories = yield this.service.find.allCategories();
  this.body = this.request.query.field ? _.pluck(categories, this.request.query.field) : categories;
  yield next;
};

exports.view = function*(next) {
  this.body = yield this.service.find.booksByCategoryName(this.params.slug);
  yield next;
};
