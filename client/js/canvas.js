function Canvas() {
	this.html();
}

Canvas.prototype.html = function () {
	// create canvas object and get 2d context
	this.canvas = document.createElement("canvas");
	var body = document.getElementById('body');
	body.style.margin = '0';
	body.appendChild(this.canvas);
	this.context = this.canvas.getContext("2d");	
};