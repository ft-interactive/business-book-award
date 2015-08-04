var errorMessage = 'You must specify a source parameter or an X-FT-Source header to identify your application.';

module.exports = function*(next) {
  var hasSource = this.query.source || this.req.headers['x-ft-source'];
  this.assert(hasSource, 400, errorMessage);
  yield next;
};
