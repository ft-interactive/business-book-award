module.exports = function *(year, rank, slug) {
  yield this.render('book', {
    title: slug.replace(/\-/g, ' '),
    rank: rank,
    year: year
  });
};
