var koa = require('koa');
var route = require('koa-route');
var views = require('koa-views');
var trace = require('koa-trace');

module.exports = function (options) {
  options = options || {};

  var app = koa();

  app.name = options.name;
  app.proxy = options.proxy;
  app.service = !!options.dummydata ? require('./service/dummydata') : require('./service');

  trace(app);

  if (process.env.NODE_ENV !== 'production') app.debug();

  app.use(views('views', {
    cache: false,
    map: {
      html: 'swig'
    }
  }));

  app.use(route.get('/', require('./controllers/home')));
  app.use(route.get('/books/:year', require('./controllers/year')));
  app.use(route.get('/books/:year/:rank/:slug', require('./controllers/book')));
  app.use(route.get('/genre/:genre', require('./controllers/genre')));

  return app;
}
