const
	ZERO_VECTOR = { x: 0, y: 0 }
DEBUG = true
{
	var oldLog = console.log;
	console.log = (...data) => {
		if (DEBUG) oldLog(...data);
	}
}

function lerpXY(a, b, t) {
	return {
		x: a.x + t * (b.x - a.x),
		y: a.y + t * (b.y - a.y)
	}
}

function generateCoins(n, bounds) {
	var pos = [];
	for (let i = 0; i < n; i++) {
		pos.push(Math.random() * bounds.x);
		pos.push(Math.random() * bounds.y);
	}
	return pos;
}

function centerText (text) {
var b = text.getBounds();
	text.x += - (b.width/2); 
}

class Component {
	constructor(gameObject) {
		this.gameObject = { worldX: 0, worldY: 0 };
		gameObject && (this.gameObject = gameObject);
	}
}

class PhysicsBody extends Component {
	constructor(gameObject) {
		super(gameObject);
		this.velocity = { x: 0, y: 0 };
		this.dampening = .035;
	}

	update() {
		this.gameObject.x += this.velocity.x;
		this.gameObject.y += this.velocity.y;
		this.velocity = lerpXY(this.velocity, ZERO_VECTOR, this.dampening);
	}
	addImpulse(x, y) {
		this.velocity.x += x;
		this.velocity.y += y;
	}
}

class GameObject extends createjs.Container {
	constructor(game, x=0, y=0) {
		super();
		this.x = x;
		this.y = y;
	}

	update() {}

	setPos(x, y) {
		this.x = x;
		this.y = y;
	}

	destroy() {
		this.parent.removeChild(this);
	}
}

class Player extends GameObject {
	constructor(game,name,x=0,y=0) {
		super(game,x,y);
		this.name = name;
		this.mode = -1;
		this.speed = .3
		this.moving = { up: 0, down: 0, left: 0, right: 0 };

		//Ship
		this.ship = new createjs.Container();
		this.addChild(this.ship);
		//Graphic
			this.shipGraphic = new createjs.Shape();
			this.ship.addChild(this.shipGraphic);
			this.shipGraphic.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
		//Nickname
			this.captainNickname = new createjs.Text("Captain", "15px Arial", "#000000");
			this.ship.addChild(this.captainNickname);
			this.captainNickname.y = 50;
			centerText(this.captainNickname);

		//Crosshair
		this.crosshair = new createjs.Container();
		this.addChild(this.crosshair);
		//Graphic
			this.crosshairGraphic = new createjs.Shape();
			this.crosshairGraphic.graphics.beginFill("Green").drawCircle(0, 0, 20);
			this.crosshair.addChild(this.crosshairGraphic);
		//Nickname
			this.cannonNickname = new createjs.Text("Cannon", "15px Arial", "#000000");
			this.crosshair.addChild(this.cannonNickname);
			this.cannonNickname.y = 20;
			centerText(this.cannonNickname)

		// Components
		this.physics = new PhysicsBody(this.ship);
	}

	setCrosshairPos(x, y) {
		this.crosshair.x = x;
		this.crosshair.y = y;
	}

	setPos(x,y) {
		this.ship.x = x;
		this.y = y;
	}

	update() {
		this.physics.addImpulse(
			(this.moving.right - this.moving.left) * this.speed,
			( this.moving.down / 2 - this.moving.up) * this.speed// + .2
		);
		this.physics.update();
		this.y += this.ship.y;
		this.ship.y = 0;
	}

	getCrosshairPos() {
		return {x:this.crosshair.x,y:this.crosshair.y}
	}

	getCrumb() {
		switch (this.mode) {
			case 0:
				return {
					name: this.name,
					mode: this.mode,
					x: this.ship.x,
					y: this.y,
					moving: this.moving
				}
			case 1:
				return {
					name: this.name,
					mode: this.mode,
					crosshair: this.getCrosshairPos()
				}
			default: 
			return {
				name: this.name,
				mode: this.mode,
				x: this.ship.x,
				y: this.y,
				moving: this.moving,
				crosshair: this.getCrosshairPos()
			}
		}
	}

	updateCrumb(p) {
		p.mode && (this.mode = p.mode);
		p.name && (this.name = p.name);
		p.captain && (this.captainNickname.text = this.captain = p.captain)&&centerText(this.captainNickname);
		p.cannon && (this.cannonNickname.text = this.cannon = p.cannon)&&centerText(this.cannonNickname);
		p.x && p.y && this.setPos(p.x, p.y);
		p.moving && (this.moving = p.moving);
		p.crosshair && this.setCrosshairPos(p.crosshair.x,p.crosshair.y);
	}
}

class Coin extends GameObject {
	constructor(game, x, y) {
		super(game, x, y);
		this.coinGraphic = new createjs.Shape();
		this.coinGraphic.graphics.beginFill("Yellow").drawCircle(0, 0, 25);
		this.addChild(this.coinGraphic);
	}
}

class Room extends createjs.Container {
	constructor() {
		super();
		this.background = new createjs.Bitmap("media/background.png");
		this.addChild(this.background);
		this.roomSize = {w:1920,h:5550};
	}
}

class Game {
	constructor(i, w, h) {
		//Setup Stage
		this.stage = new createjs.Stage(i);
		this.stage.canvas.width = w;
		this.stage.canvas.height = h;

		//Setup Game Loop
		createjs.Ticker.setFPS(60);
		createjs.Ticker.addEventListener("tick", this.update.bind(this));

		this.viewSize = {w,h};
		this.startY = this.roomSize.h-h/2;

		//Setup Game Objects
		this.room = new createjs.Container();
		this.stage.addChild(this.room);

		//Ships
		this.ships = {}
		this.shipInfo = {};

		//Setup Coins
		this.coins = [];
		this.coinPos = generateCoins(100, { x: this.roomSize.w - 200, y: this.roomSize.h });
		for (let i = 0; i < this.coinPos.length; i += 2) {
			var coin = new Coin(this, this.coinPos[i] + 100, this.coinPos[i + 1] + w / 2);
			this.addChild(coin);
			this.coins.push(coin);
		}

		//Setup Events
		window.onkeydown = this.inputDown.bind(this);
		window.onkeyup = this.inputUp.bind(this);
		this.stage.on("stagemousemove", this.mouseMove.bind(this));
	}

	emit(...a) {
		this.socket&&(this.socket.emit(...a));
	}
	
	addChild(o) {
		this.room.addChild(o);
	}

	removeChild(o) {
		this.room.removeChild(o);
	}

	join(ip) {
		var socket = io(ip);
		this.socket = socket;
		//connect
		socket.on('connect',function(){
			console.log("Connected to server")
		});
		//joinShip
		socket.on('joinShip',game.joinShip.bind(game));
		socket.on('addShip',game.addShip.bind(game));
		socket.on('removeShip',game.removeShip.bind(game));
		socket.on('pending',game.reset.bind(game));
		socket.on('moveShip',game.moveShip.bind(game));
		socket.on('moveCrosshair',function(c) {
			console.log("moveCrosshair",c);
			game.ships[c.name].updateCrumb(c);
		});
	}

	reset() {
		console.log("We be finding you a crew...")
		this.player = undefined;
		Object.values(this.ships).forEach(ship=>{ship.destroy()});
		this.ships = {};
		this.shipInfo = {};
	}

	joinShip(shipInfo) {
		console.log("joinShip",shipInfo);
		console.log("You are the",(shipInfo.mode==0?"Captain":"Cannon") + "!")
		game.shipInfo.name = shipInfo.name;
		game.shipInfo.mode = shipInfo.mode;

		for(var i in shipInfo.ships) {
			game.addShip(shipInfo.ships[i])
		}
	}

	moveShip(m) {
		console.log("moveShip",m);
		if(m.name == game.player.name&&game.player.mode ==0) return;
		game.ships[m.name].updateCrumb(m);
	}

	addShip(s) {
		if(game.ships[s.name]) return;
		console.log("addShip",s);
		var ship = new Player(this, s.name);
		ship.updateCrumb(s);
		game.ships[ship.name] = ship;
		if(ship.name == this.shipInfo.name) {
			ship.mode = this.shipInfo.mode;
			console.log(this.shipInfo.mode==0?(ship.cannon + ": Aye Aye Captain!"):(ship.captain + ": Ahoy Mateys!"))
			game.player=ship;
		}
		this.addChild(ship);
	}

	removeShip(s) {
		console.log("removeShip",s);
		if(!game.ships[s.name]) return;
		game.ships[s.name].destroy();
		delete game.ships[s.name];
	}


	update(e) {
		this.stage.canvas.width = window.innerWidth;
		this.stage.canvas.height = window.innerHeight

		if(this.player) {
			Object.values(this.ships).forEach(ship => { ship.update() })
			//this.room.x = -this.player.x;
			this.room.x = this.stage.canvas.width/2-this.roomSize.w/2
			this.room.y = this.viewSize.h/2-this.player.y;

			var minY = this.stage.canvas.height-this.roomSize.h;
			if(this.room.y<=minY) {
				this.room.y = minY;
			} else if(this.room.y>=0) {
				this.room.y = 0;
			}
		}
		this.coins.forEach(coin => { coin.update() })


		this.stage.update();
	}

	mouseMove(e) {
		if (!this.player||(this.player.mode != 1&&this.player.mode != -1)) return;
		this.player.setCrosshairPos(e.stageX, e.stageY-game.viewSize.h/2);
		this.emit("moveCrosshair",this.player.getCrosshairPos());
	}

	inputDown(e) {
		if (!this.player||(this.player.mode != 0&&this.player.mode !=-1)) return;
		console.log("INPUT: " + e.keyCode)
		switch (e.keyCode) {
			// Up (-X)
			case 38: // UP ARROW
			case 87: // W
				this.player.moving.up = 1;
				break;
			// Left (-Y)
			case 37: // Left Arrow
			case 65: // A
				this.player.moving.left = 1;
				break;
			// Down (+Y)
			case 40: // Down Arrow
			case 83: // S
				this.player.moving.down = 1;
				break;
			// Right (+X)
			case 39: // Right Arrow
			case 68: // D
				this.player.moving.right = 1;
				break;
		}
		var {up,down,left,right} = this.player.moving;
		if(!(up==0&&down==0&&left==0&&right==0)) this.emit("moveShip",{x:this.player.worldX,y:this.player.worldY,moving:this.player.moving});
	}

	inputUp(e) {
		if(!this.player) return
		console.log("INPUT: " + e.keyCode)
		switch (e.keyCode) {
			// Up (-X)
			case 38: // UP ARROW
			case 87: // W
				this.player.moving.up = 0;
				this.emit("moveShip",{x:this.player.x,y:this.player.y,moving:this.player.moving});
				break;
			// Left (-Y)
			case 37: // Left Arrow
			case 65: // A
				this.player.moving.left = 0;
				this.emit("moveShip",{x:this.player.x,y:this.player.y,moving:this.player.moving});
				break;
			// Down (+Y)
			case 40: // Down Arrow
			case 83: // S
				this.player.moving.down = 0;
				this.emit("moveShip",{x:this.player.x,y:this.player.y,moving:this.player.moving});
				break;
			// Right (+X)
			case 39: // Right Arrow
			case 68: // D
				this.player.moving.right = 0;
				this.emit("moveShip",{x:this.player.x,y:this.player.y,moving:this.player.moving});
				break;
		}
	}
}
