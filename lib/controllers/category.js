module.exports = function *(name) {
  var books = this.books = yield this.service.find.booksByCategoryName(name);
  var exists = !!books.length;
  this.assert(exists, 404, 'Category not found');
  this.page = {title: name};
  yield this.render('home', this);
};
