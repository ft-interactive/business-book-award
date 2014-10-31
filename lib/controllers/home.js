module.exports = function *(next) {
  var groups = yield this.service.find.allBooksGroupedByYear();
  var winners = yield this.service.find.winners();
  yield this.render('home', {
    groups: groups,
    winners: winners
  });
  yield next;
};
