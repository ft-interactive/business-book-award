var koa = require('koa');
var router = require('koa-router');
var trace = require('koa-trace');
var requestId = require('koa-request-id');
var conditional = require('koa-conditional-get');
var etag = require('koa-etag');
var serve = require('koa-static');
var requestId = require('koa-request-id');
var responseTime = require('koa-response-time');
var htmlMinifier = require('koa-html-minifier');
var compose = require('koa-compose');
var helmet = require('koa-helmet');
var jsonFilter = require('koa-json-filter');
var path = require('path');
var _ = require('lodash');
var views = require('./middleware/swig');
var printRequestId = require('./middleware/print-request-id');
var cacheControl = require('./middleware/cache-control');
var dataService = require('./middleware/data-service');
var responseCache = require('./middleware/response-cache');
var rejectNoSource = require('./middleware/reject-no-source.js');
var nav = require('./middleware/navigation')();
var prod = process.env.NODE_ENV === 'production';
var pkg = require('../package.json');

var baseUrl = process.env.BASE_URL || '';

module.exports = function () {

  var app = koa();

  app.name = pkg.name;
  app.proxy = true;

  app.use(requestId());
  app.use(responseTime());
  app.use(printRequestId())

  trace(app);

  if (!prod) app.debug();

  app.use(require('koa-compress')());
  app.use(helmet.hsts());
  app.use(helmet.xframe());
  app.use(helmet.iexss());
  app.use(helmet.ienoopen());
  app.use(helmet.contentTypeOptions());
  app.use(helmet.hidePoweredBy());
  app.use(conditional());
  app.use(etag());
  app.use(serve(path.resolve(__dirname, '../public'), {maxage: 2629740000 /* 1 month */}));
  app.use(views.middleware);

  app.use(function*(next) {
    this.locals.page = {
      title: null,
      canonicalUrl: this.request.url,
      social: {
        description: null,
        image: null
      }
    };
    this.locals.router = {
      url: function(routeName, params) {
        return unescape(app.url(routeName, params));
      }
    };
    yield next;
  });

  app.use(function*(next) {
    if ('category' in this.query) {
      this.status = 301;
      if (!this.query.category || this.query.category === '_') {
        this.redirect(app.url('home'));
      } else {
        this.redirect(app.url('category', this.query.category));
      }
      return;
    }
    yield next;
  });

  if (prod) app.use(responseCache({maxAge: 1000 * 60 * 60 * 24 /* 24 hrs */}));

  app.use(router(app));

  var urlFn = app.url;
  app.url = function(name, path) {
    return baseUrl + urlFn(name, path);
  };

  app.use(htmlMinifier({
    collapseWhitespace: true,
    minifyJS: true,
    minifyCSS: true
  }));

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

  var data = dataService();

  var isCached;

  if (prod) {
    isCached = function* (next) {
      if (yield* this.cashed()) return;
      yield next;
    }
  } else {
    // noop middleware
    isCached = function* (next) {
      yield next;
    }
  }

  var stdPageMiddleware = compose([
    cacheControl({
      maxage: (prod ? 60 /* 1 minute */ : 0)
    }),
    isCached,
    data,
    nav
  ]);

  app.get('home', '/', stdPageMiddleware, require('./controllers/home'));
  app.get('year', '/books/:year', stdPageMiddleware, require('./controllers/year'));
  app.get('book', '/books/:year/:rank/:slug', stdPageMiddleware, require('./controllers/book'));
  app.get('category', '/categories/:slug', stdPageMiddleware, require('./controllers/category'));

  // redirects for user convenience.
  app.redirect('/winners', app.url('home') + '#winners');
  app.redirect('/books', app.url('home'));
  app.redirect('/years', app.url('home'));
  app.get('/years/:year', function*(next){
    this.status = 301;
    this.redirect(app.url('year', {year: this.params.year}));
    yield next;
  });

  var api = {
    category: require('./api/category'),
    year: require('./api/year'),
    book: require('./api/book')
  };

  var apiMiddleware = compose([
    rejectNoSource,
    cacheControl({
      maxage: (prod ? 60 * 60 * 24 /* 24hrs */ : 0)
    }),
    isCached,
    jsonFilter(),
    data
  ]);

  app.get('/v1/categories', apiMiddleware, api.category.list);
  app.get('/v1/categories/:slug', apiMiddleware, api.category.view);
  app.get('/v1/years', apiMiddleware, api.year.list);
  app.get('/v1/years/:year', apiMiddleware, api.year.view);
  app.get('/v1/books', apiMiddleware, api.book.list);
  app.get('/v1/books/:slug', apiMiddleware, api.book.list);

  app.get('/__refresh', require('./api/refresh-data'));
  app.get(['/__health', '/v1/__health'], require('./api/health')());
  app.get('/__gtg', require('./api/gtg')());
  app.get('/__about', require('./api/about-index')({ baseUrl: baseUrl }));

  return app;
}
