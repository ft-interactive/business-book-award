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
var compose = require('koa-compose');
var helmet = require('koa-helmet');
var jsonFilter = require('koa-json-filter');
var path = require('path');
var _ = require('lodash');
var swig = require('swig');
var printRequestId = require('./middleware/print-request-id');
var cacheControl = require('./middleware/cache-control');
var dataService = require('./middleware/data-service');
var responseCache = require('./middleware/response-cache');
var nav = require('./middleware/navigation')();
var prod = process.env.NODE_ENV === 'production';


var defaultOptions = {
  name: '',
  proxy: false,
  dummydata: false,
  cacheViews: false,
  compress: false,
  baseUrl: '',
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
    cache: !!options.cacheViews ? 'memory' : false,
    map: {
      html: 'swig'
    }
  }));

  var viewData = require(options.theme.data);

  app.use(function*(next) {
    this.locals = {
      site: {
        name: 'Business books of the decade',
        staticBaseUrl: options.staticBaseUrl,
        baseUrl: options.baseUrl
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

  app.use(function*(next){
    if ('category' in this.query) {
      this.status = 301;
      this.redirect(this.query.category ? '/categories/' + this.query.category : '/');
      return;
    }
    yield next;
  });

  app.use(responseCache({maxAge: 5000}));
  app.use(router(app));

  if (prod) app.use(htmlMinifier({collapseWhitespace: true}));

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

  function* isCached(next) {
    if (yield* this.cashed()) return;
    yield next;
  }

  var stdPageMiddleware = compose([
    cacheControl({
      maxage: 60 /* 1 minute */
    }),
    isCached,
    data,
    nav
  ]);

  app.get('home', '/', stdPageMiddleware, require('./controllers/home'));
  app.get('year', '/books/:year', stdPageMiddleware, require('./controllers/year'));
  app.get('book', '/books/:year/:rank/:slug', stdPageMiddleware, require('./controllers/book'));
  app.get('category', '/categories/:slug', stdPageMiddleware, require('./controllers/category'));

  var api = {
    category: require('./api/category'),
    year: require('./api/year'),
    book: require('./api/book')
  };

  var apiMiddleware = compose([
    cacheControl({
      maxage: 60 * 60 * 24 /* 24hrs */
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

  return app;
}
