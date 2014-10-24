var http = require('http')
var lib = require('./lib');
var pkg = require('./package.json');
var app = lib({
  name: pkg.name,
  proxy: true,
  dummydata: process.env.DUMMY_DATA === 'true',
  cacheViews: process.env.CACHE_VIEWS === 'true',
  theme: pkg.theme
});
var server = http.createServer(app.callback());
var port = process.env.PORT || 3000;
server.listen(port);
console.log(app.name + ' listening on ' + port);
