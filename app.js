var http = require('http')
var lib = require('./lib');
var pkg = require('./package.json');
var app = lib({
  name: pkg.name,
  proxy: true,
  dummydata: true,
  theme: {
    views: '../node_modules/business-books-of-the-decade-frontend/dist/views',
    public: '../node_modules/business-books-of-the-decade-frontend/dist'
  }
});
var server = http.createServer(app.callback());
var port = process.env.PORT || 3000;
server.listen(port);
console.log(app.name + ' listening on ' + port);
