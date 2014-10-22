module.exports = function *() {
  this.books = this.service.find.allBooksGroupedByYear();
  this.page = {title: 'FT Business books of the decade'};
  yield this.render('home', this);
};
