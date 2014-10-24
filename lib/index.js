var koa = require('koa');
var route = require('koa-route');
var views = require('koa-views');
var trace = require('koa-trace');
var favicon = require('koa-favicon');
var serve = require('koa-static');
var path = require('path');
var _ = require('lodash');

var defaultOptions = {
  name: '',
  proxy: false,
  dummydata: false,
  theme: {
    views: 'views',
    public: 'public'
  }
};

module.exports = function (options) {
  options = _.merge(_.cloneDeep(defaultOptions), options);

  var app = koa();

  app.name = options.name;
  app.proxy = options.proxy;
  app.service = !!options.dummydata ? require('./service/dummydata') : require('./service');

  trace(app);

  if (process.env.NODE_ENV !== 'production') app.debug();

  app.use(favicon(path.resolve(__dirname, options.theme.public, '/favicon.ico')));
  app.use(serve(path.resolve(__dirname, options.theme.public)))

  app.use(views(path.resolve(__dirname, options.theme.views), {
    cache: !!options.cacheViews,
    map: {
      html: 'swig'
    }
  }));

  app.use(function*(next) {
    this.locals = {
      site: {
        name: 'FT business book of the year'
      },
      page: {
        title: null,
        canonicalUrl: this.request.url
      }
    };
    yield next;
  });

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
