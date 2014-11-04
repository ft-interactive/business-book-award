module.exports = function() {
  return function*(next) {
    this.service = this.app.service();
    yield next;
  };
};
