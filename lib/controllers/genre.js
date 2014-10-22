module.exports = function *(name) {
  var books = this.service.find.booksByGenreName(name);
  var exists = !!books.length;
  this.assert(exists, 404, 'Genre not found');
  yield this.render('home', {
    title: name,
    books: books
  });
};
