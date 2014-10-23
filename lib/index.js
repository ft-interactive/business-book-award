var koa = require('koa');
var route = require('koa-route');
var views = require('koa-views');
var trace = require('koa-trace');
var favicon = require('koa-favicon');

module.exports = function (options) {
  options = options || {};

  var app = koa();

  app.name = options.name;
  app.proxy = options.proxy;
  app.service = !!options.dummydata ? require('./service/dummydata') : require('./service');

  trace(app);

  if (process.env.NODE_ENV !== 'production') app.debug();

  app.use(favicon(__dirname + '/public/favicon.ico'));

  app.use(views('views', {
    cache: !!options.cacheViews,
    map: {
      html: 'swig'
    }
  }));

  app.use(function*(next) {
    this.service = this.app.service();
    yield next;
  });

  app.use(route.get('/', require('./controllers/home')));
  app.use(route.get('/books/:year', require('./controllers/year')));
  app.use(route.get('/books/:year/:rank/:slug', require('./controllers/book')));
  app.use(route.get('/categories/:category', require('./controllers/category')));

  return app;
}
