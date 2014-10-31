var http = require('http')
var lib = require('./lib');
var pkg = require('./package.json');

var prod = process.env.NODE_ENV === 'production';

var options = {
  name: pkg.name,
  proxy: true,
  staticBaseUrl: prod ? '/' : 'http://localhost:9000/',
  dummydata: process.env.DUMMY_DATA === 'true',
  cacheViews: prod ? 'memory' : false
};

if (prod) {
  options.theme = {
    views: '../node_modules/business-books-of-the-decade-frontend/dist/views',
    public: '../node_modules/business-books-of-the-decade-frontend/dist/public',
    data: '../node_modules/business-books-of-the-decade-frontend/dist/views/data.js',
    favicon: './public/favicon.ico',
    filters: '../node_modules/business-books-of-the-decade-frontend/dist/views/filters.js'
  };
} else {
  options.theme = {
    views: '../node_modules/business-books-of-the-decade-frontend/.tmp/views',
    public: '../node_modules/business-books-of-the-decade-frontend/.tmp',
    data: '../node_modules/business-books-of-the-decade-frontend/.tmp/views/data.js',
    favicon: './public/favicon.ico',
    filters: '../node_modules/business-books-of-the-decade-frontend/.tmp/views/filters.js'
  };
}

var app = lib(options);
var server = http.createServer(app.callback());
var port = process.env.PORT || 3000;
server.listen(port);
console.log(app.name + ' listening on ' + port);
