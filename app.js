var http = require('http')
var app = require('./server')();
var server = http.createServer(app.callback());
var port = process.env.PORT || 3000;
server.listen(port);
console.log(app.name + ' listening on ' + port);
