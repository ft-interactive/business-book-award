var koa = require('koa');
var route = require('koa-route');
var views = require('koa-views');
var trace = require('koa-trace');

module.exports = function (options) {
  options = options || {};

  var app = koa();

  trace(app);

  if (process.env.NODE_ENV !== 'production') app.debug();

  app.use(views('views', {
    cache: false,
    map: {
      html: 'swig'
    }
  }));

  app.use(route.get('/', function *() {
    yield this.render('home', {
      title: 'FT Business books of the decade'
    });
  }));

  return app;
}
