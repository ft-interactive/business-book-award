module.exports = function() {
  return function*(next) {
    console.log(this)
    this.service = this.app.service();
    yield next;
  };
};
