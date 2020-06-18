"use strict";

var port = process.env.PORT || 3000;

var http = require('http');
var express = require('express');
var app = express();
var server = http.Server(app);
app.set('port',port);

server.listen(port,function(){
	console.log(`Starting server on port: ${port}`);
})

var main = require('./server.js');
main(server);