var http = require('http')
var lib = require('./lib');

var prod = process.env.NODE_ENV === 'production';
var staticBaseUrl = prod ? (process.env.STATIC_BASE ? process.env.STATIC_BASE : '/') : 'http://localhost:9000/';
var options = {
  proxy: true,
  staticBaseUrl: staticBaseUrl,
  cacheViews: prod,
  compress: true,
  baseUrl: process.env.BASE_URL || ''
};

options.theme = {
  views: './views',
  public: './public',
  data: './views/data.js',
  favicon: './public/favicon.ico',
  filters: './views/filters.js'
};

var app = lib(options);
var server = http.createServer(app.callback());
var port = process.env.PORT || 3000;
server.listen(port);
console.log(app.name + ' listening on ' + port);
