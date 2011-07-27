window.onload = function () {
	new Client();
}

function Client() {
	/*var socket = new WebSocket("ws://192.168.1.114:3040");

	socket.onopen = function (e) {
		console.log("onopen");
	}
	
	socket.onmessage = function (e) {
		console.log("onmessage");
	}
	
	socket.onerror = function (e) {
		console.log("onerror");
	}
	
	socket.onclose = function (e) {
		console.log("onclose");
	}*/
	
	var self = this;

	// class members
	this.controlBall = true;
	this.x = 20;
	this.y = 20;
	this.speedX = 0;
	this.speedY = 0;
	this.radius = 15;
	this.friction = 0.95;
	
	this.trailMaxSize = 15;
	this.trail = new Array();
	
	//html
	this.html();
	
	// do reshape
	this.reshape();
	// start!
	this.start();
}

Client.prototype.html = function () {
	// create canvas object and get 2d context
	this.canvas = document.createElement("canvas");
	var body = document.getElementById('body');
	body.style.margin = '0';
	body.appendChild(this.canvas);
	this.context = this.canvas.getContext("2d");	
};

Client.prototype.reshape = function () {
	var self = this;
	
	// on resize event
	window.onresize = function (e) {
		self.reshape();
	};
	
	if (this.canvas) {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.context.fillStyle = "#000000";
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}
};

Client.prototype.start = function () {
	var self = this;
	var fps = 30;

	var throwing = false;
	var lastX = 0, lastY = 0;
		
	// on mouse down event
	document.onmousedown = function(e) {
		if (self.controlBall) {
			throwing = true;
			lastX = e.clientX;
			lastY = e.clientY;
		}
	};
				
	// on mouse up event
	document.onmouseup = function(e) {
		if (self.controlBall) {
			throwing = false;
		}
	};
				
	// on mouse move event
	document.onmousemove = function(e) {
		if (self.controlBall && throwing) {
			var offsetX = e.clientX - lastX;
			var offsetY = e.clientY - lastY;
						
			self.speedX += offsetX / 5;
			self.speedY += offsetY / 5;
					
			lastX = e.clientX;
			lastY = e.clientY;
		}
	};

	// set up timer to render screen
	setInterval(function() {
		self.render();
	}, 1000 / fps);
	
	// remove ball from this screen after 3 seconds
	// test to backend support...
	/*var interval = setInterval(function() {
		self.controlBall = false;
		clearInterval(interval);
	}, 3000);*/
};

Client.prototype.render = function () {					
	// erase trail
	for (var i = 0; i < this.trail.length; i++) {
		this.context.fillStyle = "#000000";
		this.context.beginPath();
		this.context.arc(this.trail[i][0], this.trail[i][1], this.radius + 1, 0, Math.PI * 2, true);
		this.context.closePath();
		this.context.fill();
	}
	
	// while tail has more elements than trailMaxSize remove the first one
	while (this.trail.length > this.trailMaxSize)
		this.trail.shift();
		
	// if this client isn't controlling the ball anymore remove the first trail element
	if (!this.controlBall && this.trail.length > 0)
		this.trail.shift();
	
	// erase ball
	if (this.controlBall) {
		this.context.fillStyle = "#000000";
		this.context.beginPath();
		this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
		this.context.closePath();
		this.context.fill();
	}
					
	// update speed
	this.speedX *= this.friction;
	this.speedY *= this.friction;
						
	// update position according to speed
	this.x += this.speedX;
	this.y += this.speedY;
					
	// create bounce effect on X axis
	if (this.x - this.radius < 0 || this.x + this.radius > this.canvas.width) {
		if (this.x - this.radius < 0) {
			this.x = this.radius;
		} else if (this.x + this.radius > this.canvas.width) {
			this.x = this.canvas.width - this.radius;
		}
							
		this.speedX *= -1;
	}
	// create bounce effect on Y axis
	if (this.y - this.radius < 0 || this.y + this.radius > this.canvas.height) {
		if (this.y - this.radius < 0) {
			this.y = this.radius;
		} else if (this.y + this.radius > this.canvas.height) {
			this.y = this.canvas.height - this.radius;
		}

		this.speedY *= -1;
	}
					
	// if speed is too small set it to zero
	// (avoid values next to zero)
	if (Math.abs(this.speedX) < 0.1)
		this.speedX = 0;
	if (Math.abs(this.speedY) < 0.1)
		this.speedY = 0;

	// draw draw trail
	for (var i = 0; i < this.trail.length; i++) {
		this.context.fillStyle = "#" + ((i / this.trail.length) * 0xff).toString(16) + "0000";
		this.context.beginPath();
		this.context.arc(this.trail[i][0], this.trail[i][1], this.radius, 0, Math.PI * 2, true);
		this.context.closePath();
		this.context.fill();
	}					
	
	// draw ball
	if (this.controlBall) {
		this.trail.push([this.x, this.y]);
			
		this.context.fillStyle = "#ff0000";
		this.context.beginPath();
		this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
		this.context.closePath();
		this.context.fill();
	}
};