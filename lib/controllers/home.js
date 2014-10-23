module.exports = function *() {
  var books = yield this.service.find.allBooksGroupedByYear();
  yield this.render('home', {
    books: books
  });
};
