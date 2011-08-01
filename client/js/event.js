/**
 * Event class to handle the request from websocket
 * 
 * 
 * 
 * @returns {Event}
 */
function Event() {
	this.events = {};
};

Event.prototype.subscribe = function (name, callback) {
	this.name = name;
	if (!this.events[name]) {
		this.events[name] = new Array();
	}
	this.events[name].push(callback);
};

Event.prototype.unsubscribe = function (name, callback) {
	this.name = name;
	this.events[name].splice(this.events[name].indexOf(callback), 1);
};

Event.prototype.call = function (name) {
	this.name = name;
	if (this.events[name]) {
		for (var i=0; i<this.events[name].length; i++) {
			this.events[name][i].apply(this, Array.prototype.slice.call(arguments, 1));
		}
	}
};

Event = new Event();