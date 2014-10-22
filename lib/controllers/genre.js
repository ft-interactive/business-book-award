module.exports = function *(name) {
   yield this.render('home', {
    title: name + ' genre index page',
    genre: name
  });
};
