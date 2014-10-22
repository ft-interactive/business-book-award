var service = require('../service');

module.exports = function *(name) {
  var genre = service().find.booksByGenreName(name);
  var exists = !!genre;

  if (!exists) {
    this.throw(404);
    return;
  }

  yield this.render('home', genre);
};
