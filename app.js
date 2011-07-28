var sys = require('sys');
var ws = require('websocket-server');
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');

var server = ws.createServer();

var clients = {};
var online = 0;


http.createServer(function(request, response) {
    var uri = url.parse(request.url).pathname;
    var filename = path.join(process.cwd(), 'client/' + uri);
    path.exists(filename, function(exists) {
    	if(!exists) {
    		response.writeHead(404, {"Content-Type": "text/plain"});
    		response.write("404 Not Found\n");
    		response.end();
    		return;
    	}

    	fs.readFile(filename, "binary", function(err, file) {
    		if(err) {
    			response.writeHead(500, {"Content-Type": "text/plain"});
    			response.write(err + "\n");
    			response.end();
    			return;
    		}

    		response.writeHead(200);
    		response.write(file, "binary");
    		response.end();
    	});
    });
}).listen(8090);

console.log('HTTP server running at port 8090');

server.addListener('connection', function (connection) {

	connection.index = 0;
	clients[connection.id] = connection;
	online = online + 1;
	
	this.broadcast(online.toString());
	
	/**
	 * Message
	 */
	connection.addListener('message', function(msg) {
		var values = msg.split('|');
		server.send(msg);
	});
	
	connection.addListener('close', function () {
		console.log(connection);
		delete clients[connection.id];
		online = online - 1; 
		connection.close();
	});	
});

server.listen(3040);

console.log('Websocket running at port 3040');