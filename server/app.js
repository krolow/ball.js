var sys = require('sys');
var ws = require('websocket-server');


var server = ws.createServer();

var clients = {};
var online = 0;

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

console.log('Server running at port 3040');