module.exports = function *(year) {
  var year = yield this.service.find.booksByYear(year);
  this.assert(year, 404, 'Year not found');
  this.locals.page.title = 'Year ' + year;
  yield this.render('home', year);
};
