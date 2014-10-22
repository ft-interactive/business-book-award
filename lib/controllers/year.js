module.exports = function *(year) {
  var books = this.service.find.booksByYear(year);
  var exists = !!books.length;
  this.assert(exists, 404, 'Year not found');
  yield this.render('home', {
    title: year,
    books: books
  });
};
