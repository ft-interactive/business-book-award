var http = require('http')
var lib = require('./lib');
var app = lib();
var server = http.createServer(app.callback());

server.listen(process.env.PORT || 3000);
