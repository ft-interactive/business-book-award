var http = require('http')
var lib = require('./lib');
var pkg = require('./package.json');
var app = lib({
  name: pkg.name,
  proxy: true,
  dummydata: true,
  theme: process.env.APP_THEME_NAME ? '../node_modules/' + process.env.APP_THEME_NAME : null
});
var server = http.createServer(app.callback());
var port = process.env.PORT || 3000;
server.listen(port);
console.log(app.name + ' listening on ' + port);
