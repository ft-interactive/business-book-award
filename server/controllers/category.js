module.exports = function *(next) {
  var category = yield this.service.find.booksByCategoryName(this.params.slug);
  this.assert(category, 404, 'Category not found');
  this.locals.page.title = category.name;
  this.locals.page.slug = category.slug;
  yield this.render('home', {
    groups: [category]
  });
  yield next;
};
