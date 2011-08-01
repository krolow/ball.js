function Ws(address, port) {
	this.init(address, port);
};

Ws.prototype.init = function (address, port) {
	this.socket = new WebSocket('ws://' + address + ':' + port);
	
	this.socket.onopen = function (e) {
	};
	
	this.socket.onmessage = function (e) {
		var data = JSON.parse(e.data);
		console.log(data);
		Event.call(data.type, data.data);
	};
	
	this.socket.onerror = function (e) {
	};
	
};

Ws.prototype.send = function (name, values) {
	this.socket.send(JSON.stringify({'type' : name, 'data' : values}));
};