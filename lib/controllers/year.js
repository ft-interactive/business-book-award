module.exports = function *(year) {
  var books = this.books = this.service.find.booksByYear(year);
  var exists = !!books.length;
  this.assert(exists, 404, 'Year not found');
  this.page = {title: year};
  yield this.render('home', this);
};
