var express = require('express');
var server = express.createServer();
server.configure('development', 'production', function() {
  server.set('view engine', 'ejs');
  server.use(express.bodyParser());
  server.use(express.static(__dirname + '/assets'));
  server.use(express.cookieParser());
  server.use(express.session({ secret: 'swu8usw' }));
});

server.configure('development', function(){
  server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

server.configure('production', function(){
  server.use(express.errorHandler());
});

require('./config/boot')(server);
server.set('view options', { layout: false });
server.listen(parseInt(process.env.PORT || 3001));
