var service = require('../service');

module.exports = function *() {

  var books = service().find.findAllBooksGroupedByYear();

  yield this.render('home', {
    title: 'FT Business books of the decade',
    books: books
  });
};
