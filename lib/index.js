var koa = require('koa');
var router = require('koa-router')
var views = require('koa-views');
var trace = require('koa-trace');

module.exports = function (options) {
  options = options || {};

  var app = koa();

  app.name = options.name;
  app.proxy = options.proxy;

  trace(app);

  if (process.env.NODE_ENV !== 'production') app.debug();

  app.use(views('views', {
    cache: false,
    map: {
      html: 'swig'
    }
  }));

  app.use(router(app));

  app.get('home', '/', require('./controllers/home'));
  app.get('year', '/books/:year', require('./controllers/year'));
  app.get('book', '/books/:year/:rank/:slug', require('./controllers/book'));
  app.get('genre', '/genre/:genre', require('./controllers/genre'));

  return app;
}
