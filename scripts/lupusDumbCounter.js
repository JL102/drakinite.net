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
		this.sendMessage({value: this.value});
	},
	subtract: function() {
		this.value -= 1;
		this.sendMessage({event: 'undo', value: this.value})
	},
	set: function (value) {
		this.value = value;
		this.sendMessage({value: this.value});
	},
	clear: function() {
		this.value = 0;
		this.sendMessage({value: this.value});
	},
	sendMessage: function(message) {
		for (var socket of this.sockets) {
			if (typeof message === 'object') socket.send(JSON.stringify(message));
			else socket.send(message);
		}
	},
	getValue: function() {
		return this.value;
	}
};

LDC.init();
module.exports = LDC;