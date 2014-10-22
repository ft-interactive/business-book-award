module.exports = function *() {
  var books = this.service.find.allBooksGroupedByYear();
  yield this.render('home', {
    title: 'FT Business books of the decade',
    books: books
  });
};
