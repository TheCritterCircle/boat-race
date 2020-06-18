/*

Server
name
io:socket server
rooms
clientConnected(socket)
emit()

Room:
name
started
ships
pending
start()
joinRoom()
getShips()
addShip(ship)
emit()

Ship
name
room
x
y
moving
crosshair
captain:Client
cannon:Client
getCrumb()
getRoom()
emit()

Client
name
socket
ship
bindSocket(name)
dissconnect
joinGame
moveShip
moveCrosshair()
getShip()
emit()
*/

"use strict";

const socketIo = require('socket.io');
const e = require('express');

class Server {
	constructor(httpServer) {
		this.name = "server";
		this.io = socketIo.listen(httpServer);
		this.socket = this.io.sockets;
		this.pending = undefined;
		this.rooms = {};

		this.io.on('connect',this.joinServer.bind(this));
		console.log("Created Server " + this.name);
	}

	emit(...a) {
		this.socket.emit(...a);
	}

	joinServer(socket) {
		new Client(socket);
	}

	requestShip(client) {
		if(this.pending) {
			//create a new ship with the pending client
			var ship = new Ship(this.pending,client);
			this.pending = undefined;

			//Join or Create a room
			var room = Object.values(this.rooms).filter(room=>!room.started)[0];
			if(!room) {
				room = new Room(ship);
				this.rooms[room.name] = room;
			}
			room.addShip(client,ship);
		} else {
			this.pending = client;
			console.log(client.name,"has requested for a ship.")
			client.emit("pending");
		}
	}

	cancelShipRequest(client) {
		if(this.pending&& this.pending.getID()==client.getID()) {
			console.log(client.name,"has canceled their ship request")
			this.pending = undefined;
		}
	}

}

class Room {
	constructor(ship) {
		this.name = ship.name + "-room";
		this.started = false;
		this.ships = {};

		console.log("Room Created:",this.name);
	}

	start() {
		this.started = true;
	}

	emit(client,...a) {
		client.socket.to(this.name).emit(...a);
	}
	getShips() {
		return Object.values(this.ships).map(s => s.getCrumb());
	}
	addShip(client,ship) {
		this.ships[ship.name] = ship;
		ship.join(this);
		this.emit(client,"addShip",ship.getCrumb())
	}
	removeShip(client,ship) {
		this.emit(client,'removeShip',ship.getCrumb());
		delete this.ships[ship.name];
	}
}

class Ship {
	constructor(captain,cannon) {
		this.name = captain.name + "-" + cannon.name; 
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
		this.cannon = cannon

		console.log("Ship Created:",this.name)
		captain.join(this.name);
		captain.ship = this.name;
		cannon.join(this.name);
		cannon.ship = this.name;
	}

	emit(client,...a) {
		client.socket.to(this.name).emit(...a);
	}

	getCrumb() {
		return {
			name: this.name,
			captain:this.captain.name,
			cannon:this.cannon.name,
			x: this.x,
			y: this.y,
			moving: this.moving,
			crosshair: this.crosshair
		}
	}
	
	getRoom() {
		if(!this.room) throw "Ship is not in a room";;
		return server.rooms[this.room];
	}

	join(room) {
		this.captain.join(room.name);
		this.cannon.join(room.name);
		this.captain.room = room.name;
		this.cannon.room = room.name;
		this.captain.emit('joinShip', {
			name: this.name,
			mode: 0,
			ships: room.getShips()
		});
		this.cannon.emit('joinShip', {
			name: this.name,
			mode: 1,
			ships: room.getShips()
		});
		console.log(this.name,"has joined",room.name);
	}

	destroy(client) {
		if(this.captain.getID()==client.getID()) {
			this.cannon.reset();
			server.requestShip(this.cannon)
		} else {
			this.captain.reset();
			server.requestShip(this.captain);
		}
		this.getRoom().removeShip(client,this);
		console.log("Ship destroyed",name);
	}

}

class Client {
	constructor(socket) {
		this.name = socket.id;
		this.socket = socket;

		this.emit("connect");
		this.bindSocket("disconnect");
		this.bindSocket("joinGame");
		this.bindSocket("moveShip");
		this.bindSocket("moveCrosshair");
		console.log("Client Connected:", this.name);

	}
	getID() {
		return this.socket.id;
	}
	bindSocket(name) {
		this.socket.on(name,this[name].bind(this));
	}
	getRoom() {
		if(!this.room) throw "Client is not in a room";
		return server.rooms[this.room];
	}
	getShip() {
		if(!(this.room&&this.ship)) throw "Client is not in a ship or a room";
		return server.rooms[this.room].ships[this.ship];
	}
	emit(...a) {
		this.socket.emit(...a);
	}
	disconnect() {
		server.cancelShipRequest(this);
		this.ship&&this.getShip().destroy(this);
		console.log("Client Disconnected:", this.name);
	}
	joinGame(nickname) {
		this.name = nickname;
		server.requestShip(this);
	}

	moveShip(m) {
		console.log(this.name,"moveShip",m)
		var {x,y,moving} = m;
		if(!this.ship) return;
		var ship = this.getShip();
		var room = this.getRoom();
		ship.x = x;
		ship.y = y;
		ship.moving = moving;
		room.emit(this,'moveShip',{name:this.ship,x,y,moving});
	}
	moveCrosshair(m) {
		console.log(this.name,"moveCrosshair",m)
		if(!this.ship) return;
		var ship = this.getShip();
		var room = this.getRoom();
		ship.crosshair = m;
		room.emit(this,'moveCrosshair',{name:this.ship,crosshair:m});
	}

	join(a) {
		this.socket.join(a);
		console.log(this.name,"has joined",a);
	}

	leave(a) {
		this.socket.leave(a);
		console.log(this.name,"has left",a);
	}

	reset() {
		this.leave(this.room);
		this.leave(this.ship);
		this.room = undefined;
		this.ship = undefined;
	}
}


var server;
function main(httpServer) {
	server = new Server(httpServer);
}

module.exports = main;