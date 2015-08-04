var http = require('http')
var lib = require('./server');

var prod = process.env.NODE_ENV === 'production';
var staticBaseUrl = process.env.STATIC_BASE ? process.env.STATIC_BASE : '/';
var options = {
  proxy: true,
  staticBaseUrl: staticBaseUrl,
  cacheViews: prod,
  compress: true,
  baseUrl: process.env.BASE_URL || ''
};

var app = lib(options);
var server = http.createServer(app.callback());
var port = process.env.PORT || 3000;
server.listen(port);
console.log(app.name + ' listening on ' + port);
