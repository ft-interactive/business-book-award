module.exports = function(opts) {
  return function*(next) {
    this.set('Cache-Control', 'max-age=' + opts.maxage);
    yield next;
  };
};
