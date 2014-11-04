var koa = require('koa');
var router = require('koa-router');
var views = require('koa-views');
var trace = require('koa-trace');
var favicon = require('koa-favicon');
var requestId = require('koa-request-id');
var conditional = require('koa-conditional-get');
var etag = require('koa-etag');
var serve = require('koa-static');
var requestId = require('koa-request-id');
var responseTime = require('koa-response-time');
var htmlMinifier = require('koa-html-minifier');
var helmet = require('koa-helmet');
var path = require('path');
var _ = require('lodash');
var swig = require('swig');
var printRequestId = require('./middleware/print-request-id');
var prod = process.env.NODE_ENV === 'production';


var defaultOptions = {
  name: '',
  proxy: false,
  dummydata: false,
  cacheViews: false,
  compress: false,
  theme: {}
};

module.exports = function (options) {
  options = _.merge(_.cloneDeep(defaultOptions), options);

  console.log('Starting to with options', options);

  var app = koa();

  app.name = options.name;
  app.proxy = options.proxy;
  app.service = !!options.dummydata ? require('./service/dummydata') : require('./service');

  app.use(requestId());
  app.use(responseTime());
  app.use(printRequestId())

  trace(app);

  if (!prod) app.debug();

  if (options.compress) {
    app.use(require('koa-compress')());
  }

  if (prod) app.use(htmlMinifier({collapseWhitespace: true}));

  app.use(helmet.hsts());
  app.use(helmet.xframe());
  app.use(helmet.iexss());
  app.use(helmet.ienoopen());
  app.use(helmet.contentTypeOptions());
  app.use(helmet.hidePoweredBy());
  app.use(favicon(path.resolve(__dirname, options.theme.favicon)));
  app.use(conditional());
  app.use(etag());
  app.use(serve(path.resolve(__dirname, options.theme.public), {maxage: 2629740000 /* 1 month */}));

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
        staticBaseUrl: options.staticBaseUrl
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
    year: require('./api/year'),
    book: require('./api/book')
  };

  app.get('/v1/categories', api.category.list);
  app.get('/v1/categories/:slug', api.category.view);
  app.get('/v1/years', api.year.list);
  app.get('/v1/years/:year', api.year.view);
  app.get('/v1/books', api.book.list);
  app.get('/v1/books/:slug', api.book.list);

  return app;
}
