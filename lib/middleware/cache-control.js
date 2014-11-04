module.exports = function(opts) {
  return function*(next) {
    this.set('Cache-Controls', 'max-age=' + opts.maxage);
    yield next;
  };
};
