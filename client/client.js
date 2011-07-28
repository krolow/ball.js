function Client() {

	var self = this;

	// class members
	this.controlBall = false;
	this.x = 0;
	this.y = 0;
	this.speedX = 0;
	this.speedY = 0;
	this.radius = 15;
	this.friction = 0.95;
	
	this.lastMouseX = 0;
	this.lastMouseY = 0;
	this.throwingBall = false;
	
	this.trailMaxSize = 20;
	this.trail = new Array();
	
	// socket
	this.socket();
	
	// html
	this.html();
	
	// do reshape
	this.reshape();
	// start!
	this.start();
};

Client.prototype.socket = function () {
	var self = this;
	
	this.socket = new WebSocket("ws://localhost:3040");

	this.socket.onmessage = function (e) {
		var data = JSON.parse(e.data);
		console.log(data);
		if (data.online) {
			if (data.online == 1) {
				self.getBall(250, 250, 5, 15);
			}
		} else {
			if (data[0] == 0) {
				self.getBall(window.innerWidth - self.radius, data[1], data[2], data[3]);	
			} else {
				self.getBall(self.radius, data[1], data[2], data[3]);
			}
			
		}
	};
	
	this.socket.onerror = function (e) {
		console.log("onerror");
	};
	
	this.socket.onclose = function (e) {
		console.log("onclose");
	};	
};

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
		
	// on mouse down event
	document.onmousedown = function(e) {
		if (self.controlBall) {
			self.throwingBall = true;
			self.lastMouseX = e.clientX;
			self.lastMouseY = e.clientY;
		}
	};
				
	// on mouse up event
	document.onmouseup = function(e) {
		if (self.controlBall) {
			self.throwingBall = false;
		}
	};
				
	// on mouse move event
	document.onmousemove = function(e) {
		if (self.controlBall && self.throwingBall) {
			var offsetX = e.clientX - self.lastMouseX;
			var offsetY = e.clientY - self.lastMouseY;
						
			self.speedX += offsetX / 5;
			self.speedY += offsetY / 5;
					
			self.lastMouseX = e.clientX;
			self.lastMouseY = e.clientY;
		}
	};

	// set up timer to render screen
	setInterval(function() {
		self.render();
	}, 1000 / fps);
};

// called when this client receives control of the ball
Client.prototype.getBall = function (posX, posY, speedX, speedY) {
	this.controlBall = true;
	this.x = posX;
	this.y = posY;
	this.speedX = speedX;
	this.speedY = speedY;
};

// called to release the control of the ball from this client
Client.prototype.dropBall = function () {
	this.controlBall = false;
	this.lastMouseX = 0;
	this.lastMouseY = 0;
	this.throwingBall = false;
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
	
	// if this client isn't controlling the ball anymore remove the first trail element
	if (!this.controlBall && this.trail.length > 0)
		this.trail.shift();
	
	// while tail has more elements than trailMaxSize remove the first one
	while (this.trail.length > this.trailMaxSize)
		this.trail.shift();
	
	// erase ball
	if (this.controlBall) {
		this.context.fillStyle = "#000000";
		this.context.beginPath();
		this.context.arc(this.x, this.y, this.radius + 1, 0, Math.PI * 2, true);
		this.context.closePath();
		this.context.fill();
	}
		
	// update ball physics if this client has control of the ball
	if (this.controlBall) {
		// update speed
		this.speedX *= this.friction;
		this.speedY *= this.friction;
				
		// update position according to speed
		this.x += this.speedX;
		this.y += this.speedY;
		
		// if ball cross screen edges of this client (left or right) send a message to server
		if (this.controlBall && (this.x - this.radius < 0 || this.x + this.radius > this.canvas.width)) {
			if (this.x - this.radius < 0) {
				var values = [0, this.y, this.speedX, this.speedY];	
			} else {
				var values = [1, this.y, this.speedX, this.speedY];
			}

			this.dropBall();
			this.socket.send(JSON.stringify(values));
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
		if (Math.abs(this.speedX) < 0.01) {
			this.speedX = 0;
		}
		if (Math.abs(this.speedY) < 0.01) {
			this.speedY = 0;
		}
	}

	// draw trail
	for (var i = 0; i < this.trail.length; i++) {
		this.context.fillStyle = "#" + (Math.round((i / this.trailMaxSize) * 0xff)).toString(16) + "0000";
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

window.onload = function () {
	new Client();
};