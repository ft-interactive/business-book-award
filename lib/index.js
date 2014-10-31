var koa = require('koa');
var router = require('koa-router');
var views = require('koa-views');
var trace = require('koa-trace');
var favicon = require('koa-favicon');
var serve = require('koa-static');
var path = require('path');
var _ = require('lodash');
var swig = require('swig');

var defaultOptions = {
  name: '',
  proxy: false,
  dummydata: false,
  cacheViews: false,
  theme: {
    views: '../node_modules/business-books-of-the-decade-frontend/.tmp/views',
    public: '../node_modules/business-books-of-the-decade-frontend/.tmp',
    data: '../node_modules/business-books-of-the-decade-frontend/.tmp/views/data.js',
    favicon: './public/favicon.ico',
    filters: '../node_modules/business-books-of-the-decade-frontend/.tmp/views/filters.js'
  }
};

module.exports = function (options) {
  options = _.merge(_.cloneDeep(defaultOptions), options);

  console.log('Starting to with options', options);

  var app = koa();

  app.name = options.name;
  app.proxy = options.proxy;
  app.service = !!options.dummydata ? require('./service/dummydata') : require('./service');

  trace(app);

  if (process.env.NODE_ENV !== 'production') app.debug();

  app.use(favicon(path.resolve(__dirname, options.theme.favicon)));
  app.use(serve(options.theme.public));

  var filters = require(path.resolve(__dirname, options.theme.filters));

  for (key in filters) {
    if (typeof filters[key] === 'function') {
      swig.setFilter(key, filters[key]);
    }
  }

  app.use(views(options.theme.views, {
    cache: options.cacheViews,
    map: {
      html: 'swig'
    }
  }));

  var viewData = require(options.theme.data);

  app.use(function*(next) {
    this.locals = {
      site: {
        name: 'Business books of the decade',
        staticBaseUrl: viewData.staticBaseUrl || ''
      },
      viewData: viewData,
      page: {
        title: null,
        canonicalUrl: this.request.url
      },
      router: {
        url: function(routeName, params) {
          return unescape(app.url(routeName, params));
        }
      }
    };
    yield next;
  });

  app.use(function*(next) {
    this.service = this.app.service();
    yield next;
  });

  app.use(function*(next){
    if (this.query.category) {
      this.status = 301;
      this.redirect('/categories/' + this.query.category);
      return;
    }
    yield next;
  });

  app.use(route.get('/', require('./controllers/home')));
  app.use(route.get('/books/:year', require('./controllers/year')));
  app.use(route.get('/books/:year/:rank/:slug', require('./controllers/book')));
  app.use(route.get('/categories/:category', require('./controllers/category')));

  return app;
}
