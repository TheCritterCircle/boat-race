"use strict";

const socketIo = require('socket.io');
const e = require('express');
var server;


class Ship {
	constructor(captain, cannon) {
		this.x = 0;
		this.y = 0;
		this.moving = {
			up: 0,
			down: 0,
			left: 0,
			right: 0
		};
		this.crosshair = { x: 0, y: 0 };
		this.captain = captain;
		this.cannon = cannon;
		captain.shipID = this.getID();
		cannon.shipID = this.getID();

		console.log("Ship Created: " + this.getID())
	}

	getID() {
		return this.captain.socket.id + this.cannon.socket.id;
	}

	getCrumb() {
		return {
			name: this.getID(),
			captain:this.captain.nickname,
			cannon:this.cannon.nickname,
			x: this.x,
			y: this.y,
			moving: this.moving,
			crosshair: this.crosshair
		}
	}

	join(room) {
		this.room = room;
		this.captain.socket.join(room);
		this.cannon.socket.join(room);
	}
}

class Client {
	constructor(socket) {
		this.socket = socket;
		this.socket.emit("connect");

		this.bindSocket("disconnect");
		this.bindSocket("joinGame");
		this.bindSocket("moveShip");
		this.bindSocket("moveCrosshair");
		console.log("Client Connected: " + socket.id);
		this.room = "game";
	}
	
	bindSocket(name) {
		this.socket.on(name,this[name].bind(this));
	}

	disconnect() {
		if(server.pending&& server.pending.socket.id==this.socket.id) server.pending = undefined;
		if(this.shipID) {
			if(server.ships[this.shipID].captain.socket.id==this.socket.id) {
				server.pend(server.ships[this.shipID].cannon)
			} else {
				server.pend(server.ships[this.shipID].captain);
			}
			this.emitAll('removeShip',server.ships[this.shipID].getCrumb());
		}
		delete server.ships[this.shipID]
		console.log("client disconnected:", this.socket.id);

	}
	joinGame(nickname) {
		console.log(this.socket.id,"joinGame",nickname)
		this.nickname = nickname;
		if (server.pending) {
			var ship = new Ship(server.pending, this);
			server.pending = undefined;
			var shipName = ship.getID();
			
			this.emitAll('addShip',ship.getCrumb());
			ship.join(this.room);

			server.ships[shipName] = ship;
			ship.captain.socket.emit('joinShip', {
				name: shipName,
				mode: 0,
				ships: server.getShipCrumbs()
			});
			ship.cannon.socket.emit('joinShip', {
				name: shipName,
				mode: 1,
				ships: server.getShipCrumbs()
			});

		} else {
			server.pend(this);
		}
	}

	moveShip(m) {
		console.log(this.socket.id,"moveShip",m)
		console.log(this)
		var {x,y,moving} = m;
		if(!this.shipID) return;
		server.ships[this.shipID].x = x;
		server.ships[this.shipID].y = y;
		server.ships[this.shipID].moving = moving;
		this.emitAll('moveShip',{name:this.shipID,x,y,moving});
	}
	moveCrosshair(m) {
		console.log(this.socket.id,"moveCrosshair",m)
		if(!this.shipID) return;
		server.ships[this.shipID].crosshair = m;
		this.emitAll('moveCrosshair',{name:this.shipID,crosshair:m});
	}

	emitAll(...a) {
		this.socket.broadcast.to(this.room).emit(...a);
	}
}

class Server {
	constructor(server) {
		this.io = socketIo.listen(server);
		this.clients = [];
		this.ships = {};

		this.io.on('connect', this.clientConnected.bind(this));
		console.log("Created Server " + this.io.id);
	}

	clientConnected(socket) {
		this.clients.push(new Client(socket));
	}

	getShipCrumbs() {
		return Object.values(this.ships).map(s => s.getCrumb());
	}

	pend(client) {
		this.pending = client;
		client.socket.leave(client.room);
		client.shipID = undefined;
		client.socket.emit("pending");
	}
}

function main(httpServer) {
	server = new Server(httpServer);
	global.server = server
}

module.exports = main;