var fs = require('fs');

// load Express and build the app
var express = require('express');
var app = express();
var server = require('http').Server(app);
var socketio = require('socket.io')(server);	// load socket module and initialize it with the server object


// logging middleware
app.use(function(request, response, next) {
	console.log(request.method, request.url, 'HTTP' + request.httpVersion);
	next();
});

// static resource handler middleware
app.use(express.static('public', {'index':['index.html','index.htm']}));

// wait for websocket connection
socketio.on('connection', function(socket) {

	// execute the logic while the client is connected
	console.log("Socket client connected");

	// reads log file at specified location and sends its content to the client
	var sendData = function(name, path) {
		fs.readFile(path, 'utf8', function(error, data) {
			if (error) {
				console.error("Error reading data from file");
				return;
			}
			socketio.emit(name, data);
		});
	};

	// wait for socket events and send data
	var watchers = [];
	socket.on('watch', function(event) {
		// add a watcher for the event, if it doesn't already exist
		if (!watchers.hasOwnProperty(event.name)) {
			console.log("Watching for: " + event.name);
			watchers[event.name] = event;

			sendData(event.name, event.path);

			// watch the file for changes, and push its content to the client, once changed
			fs.watchFile(event.path, function(current, previous) {
				sendData(event.name, event.path);
			});
		}
	});

	socket.on('disconnect', function() {
		console.log("Removing file watchers ...");
		watchers.forEach(function(event) {
			fs.unwatchFile(event.path);
		});
		console.log("Socket client disconnected");
	});
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

// binds and listens for connections on specified host and port
server.listen(8086, '127.0.0.1', function() {
	console.log('Server running at http://127.0.0.1:8086');
});
