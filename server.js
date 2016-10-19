// load Express and http modules
var express = require('express');
var http = require('http');

// build the app
var app = express();

// logging middleware
app.use(function(request, response, next) {
	console.log(request.method, request.url, 'HTTP' + request.httpVersion);
	next();
});

// response header configuration middleware
app.use(function(request, response, next) {
	response.setHeader("Content-Type", "text/plain" );
	response.setHeader('Access-Control-Allow-Origin', '127.0.0.1');
	next();
});

// error-handling middleware
app.use(function(error, request, response, next) {
	if (error) {
		console.error(error.stack);
		response.status(500).send("An error occured!");
		next(error);
	}
	next();
});

// add static resource handler as a middleware to Express
app.use(express.static('public', {'index' : [ 'index.html', 'index.htm' ]}));

// bind and listen for connections on specified host and port
http.createServer(app).listen(8086, '127.0.0.1', function() {
	console.log('Server running at http://127.0.0.1:8086/');
});
