module.exports = function *(name) {
  var category = yield this.service.find.booksByCategoryName(name);
  this.assert(category, 404, 'Category not found');
  this.locals.page.title = name;
  yield this.render('home', category);
};
