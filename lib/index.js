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
        name: 'Business books of the decade',
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
    if ('category' in this.query) {
      this.status = 301;
      this.redirect(this.query.category ? '/categories/' + this.query.category : '/');
      return;
    }
    yield next;
  });

  app.use(router(app));

  app.param('year', function *(year, next) {
    this.params.year = Number(year);
    this.assert(!isNaN(this.params.year), 400, 'Year must be a number') 
    yield next;
  });

  var ranks = {
    winner: 'winner',
    shortlist: 'shortlist',
    longlist: 'longlist'
  };

  app.param('rank', function *(rank, next) {
    this.assert(ranks[rank], 400, rank + ' is not a valid rank.') 
    yield next;
  });

  function* nav(next) {
    this.locals.categories = yield this.service.find.allCategories();
    yield next;
  }

  app.get('home', '/', nav, require('./controllers/home'));
  app.get('year', '/books/:year', nav, require('./controllers/year'));
  app.get('book', '/books/:year/:rank/:slug', nav, require('./controllers/book'));
  app.get('category', '/categories/:slug', nav, require('./controllers/category'));

  var api = {
    category: require('./api/category'),
    year: require('./api/year')
  };

  app.get('/v1/categories', api.category.list);
  app.get('/v1/categories/:slug', api.category.view);
  app.get('/v1/years', api.year.list);
  app.get('/v1/years/:year', api.year.view);

  return app;
}
