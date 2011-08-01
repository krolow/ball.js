window.onload = function () {
	var ws = new Ws('localhost', 8190);
	
	Event.subscribe('ball.send', function (data) {
		ws.send(this.name, data);
	});
	
	var canvas = new Canvas();
	var ball = new Ball(canvas.canvas, canvas.context);
};