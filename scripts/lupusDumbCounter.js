var LDC = {
	init: function() {
		this.sockets = [];
		this.value = 0;
	},
	addWebsocket: function(socket) {
		this.sockets.push(socket);
	},
	add: function() {
		this.value += 1;
		this.sendMessage(this.value);
	},
	subtract: function() {
		this.value -= 1;
	},
	clear: function() {
		this.value = 0;
		this.sendMessage(this.value);
	},
	sendMessage: function(message) {
		for (var socket of this.sockets) {
			socket.send(message);
		}
	},
	getValue: function() {
		return this.value;
	}
};

LDC.init();
module.exports = LDC;