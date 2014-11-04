module.exports = function() {
  return function*(next) {
    this.locals.categories = yield this.service.find.allCategories();
    yield next;
  };
};
