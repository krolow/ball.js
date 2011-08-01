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



var clients = new Array();
var online = 0;
var server = ws.createServer();


server.addListener('connection', function (connection) {

	var self = this;
	var withBall = 0;
	
	online += 1;
	
	clients.push(connection.id);
	
	this.broadcast(JSON.stringify({'type' : 'online', 'data' : online}));
	
	connection.addListener('message', function(data) {
		var data = JSON.parse(data);
		
		var values = data.data;
		var index = clients.indexOf(connection.id);
		
		if (values[0] == 0) {
			
			if (clients[index + 1]) {
				withBall = index + 1;
			} else {
				withBall = 0;
			}
		} else {
			if (clients[index - 1]) {
				withBall = index - 1;
			} else {
				withBall = clients.length - 1;
			}			
		}
		self.send(clients[withBall], JSON.stringify({'type' : 'ball.get', 'data' : data.data}));
	});
	
	connection.addListener('close', function () {
		clients.splice(clients.indexOf(connection.id), 1);		
		connection.close();
		self.broadcast(JSON.stringify({'type' : 'online', 'data' : clients.length}));
	});	
});

server.listen(8190);

console.log('Websocket running at port 8190');