var sys = require('sys');
var ws = require('websocket-server');
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');

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



var clients = {};
var clientsArray = new Array();
var online = 0;
var server = ws.createServer();


server.addListener('connection', function (connection) {

	var self = this;
	
	online += 1;
	
	clientsArray.push(connection.id);
	connection.index = clientsArray.length - 1;
	
	this.broadcast(JSON.stringify({'online' : online}));
	
	/**
	 * Message
	 */
	connection.addListener('message', function(msg) {
		var current = clientsArray[connection.index];
		
		var values = JSON.parse(msg);
		var index = 0;
		if (values[0] == 0) {
			if (clientsArray[connection.index + 1]) {
				index = connection.index + 1;
			} else {
				index = 0;
			}
		} else {
			if (clientsArray[connection.index - 1]) {
				index = connection.index - 1;
			} else {
				index = clientsArray.length - 1;
			}			
		}
		console.log(index);
		console.log(clientsArray[index]);
		self.send(clientsArray[index], msg);
	});
	
	connection.addListener('close', function () {
		online -= 1;
		delete clients[connection.id];
		clientsArray.splice(connection.index, 1);
		connection.close();
		
		self.broadcast(JSON.stringify({'online' : online}));
	});	
});

server.listen(3040);

console.log('Websocket running at port 3040');