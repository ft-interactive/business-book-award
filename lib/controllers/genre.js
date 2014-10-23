module.exports = function *(name) {
  var books = this.books = yield this.service.find.booksByGenreName(name);
  var exists = !!books.length;
  this.assert(exists, 404, 'Genre not found');
  this.page = {title: name};
  yield this.render('home', this);
};
