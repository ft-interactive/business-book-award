module.exports = function *(next) {
  var year = yield this.service.find.booksByYear(this.params.year);
  this.assert(year, 404, 'Year not found');
  this.locals.page.title = 'Year ' + year.name;
  yield this.render('home', {
    groups: [year]
  });
  yield next;
};
