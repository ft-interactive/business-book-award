var service = require('../service');

module.exports = function *() {

  var books = service().find.allBooksGroupedByYear();

  yield this.render('home', {
    title: 'FT Business books of the decade',
    books: books
  });
};
