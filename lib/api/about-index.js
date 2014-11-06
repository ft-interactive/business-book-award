var pkg = require('../../package.json');

// Origami Service index
// http://origami.ft.com/docs/syntax/web-service-index/
module.exports = function(options) {
  return function*(next) {
    console.log(this.req);
    this.body = {
      name: pkg.name,
      versions: [
        (options.baseUrl || 'http://' + this.headers.host) + '/v1'
      ]
    };
    yield next;
  };
};
