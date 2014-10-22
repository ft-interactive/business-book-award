module.exports = function *(year) {
  yield this.render('home', {
    title: year + ' year index page'
  });
};
