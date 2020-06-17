const
	ZERO_VECTOR = { x: 0, y: 0 }
DEBUG = true
{
	var oldLog = console.log;
	console.log = (...data) => {
		if (DEBUG) oldLog(...data);
	}
}

var game;

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
		this.gameObject.worldX += this.velocity.x;
		this.gameObject.worldY += this.velocity.y;
		this.velocity = lerpXY(this.velocity, ZERO_VECTOR, this.dampening);
	}
	addImpulse(x, y) {
		this.velocity.x += x;
		this.velocity.y += y;
	}
}

class GameObject extends createjs.Shape {
	constructor(game, x=0, y=0) {
		super();
		this.worldX = x;
		this.worldY = y;
		this.x = 0;
		this.y = 0;
		game.stage.addChild(this);
	}

	update() {
		var pos = game.worldToLocalPos(this.worldX, this.worldY)
		this.x = pos.x;
		this.y = pos.y;
	}

	setPos(x, y) {
		this.worldX = x;
		this.worldY = y;
	}

	destroy() {
		game.stage.removeChild(this);
	}
}
class Crosshair extends GameObject {
	constructor(game, x, y) {
		super(game, x, y);
		this.graphics.beginFill("Green").drawCircle(0, 0, 20);
		this.text = new createjs.Text("Hello World", "15px Arial", "#000000");
		game.stage.addChild(this.text);
	}
	update() {
		super.update();
		this.text.x = this.x;
		this.text.y = this.y + 30;
		centerText(this.text);
	}

	destroy() {
		game.stage.removeChild(this.text);
		super.destroy()
	}
}

class Ship extends GameObject {
	constructor(game,name) {
		super(game);
		this.name = name;
		this.mode = -1;
		this.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
		this.speed = .3
		this.moving = { up: 0, down: 0, left: 0, right: 0 };
		this.crosshairPos = { x: 0, y: 0 };

		//Child GameObjects
		this.crosshair = new Crosshair(game, 0, 0);
		this.text = new createjs.Text("Hello World", "15px Arial", "#000000");
		game.stage.addChild(this.text);

		// Components
		this.physics = new PhysicsBody(this);
	}

	destroy() {
		this.crosshair.destroy();
		game.stage.removeChild(this.text);
		super.destroy()
	}

	setCrosshairPos(x, y) {
		this.crosshairPos = { x, y };
	}

	update() {
		this.physics.addImpulse(
			(this.moving.right - this.moving.left) * this.speed,
			(this.moving.up - this.moving.down / 2) * this.speed + .2
		);
		this.physics.update();
		super.update();
		this.crosshair.worldX = this.crosshairPos.x;
		this.crosshair.worldY = this.worldY - this.crosshairPos.y + this.stage.canvas.height / 2;
		this.crosshair.update();
		
		this.text.x = this.x;
		this.text.y = this.y + 60;
		centerText(this.text);
	}

	getCrumb() {
		switch (this.mode) {
			case 0:
				return {
					name: this.name,
					mode: this.mode,
					x: this.worldX,
					y: this.worldY,
					moving: this.moving
				}
			case 1:
				return {
					name: this.name,
					mode: this.mode,
					crosshair: this.crosshairPos
				}
			default: 
			return {
				name: this.name,
				mode: this.mode,
				x: this.worldX,
				y: this.worldY,
				moving: this.moving,
				crosshair: this.crosshairPos
			}
		}
	}

	updateCrumb(p) {
		p.mode && (this.mode = p.mode);
		p.name && (this.name = p.name);
		p.captain && (this.text.text = this.captain = p.captain);
		p.cannon && (this.crosshair.text.text = this.cannon = p.cannon);
		p.x && p.y && this.setPos(p.x, p.y);
		p.moving && (this.moving = p.moving);
		p.crosshair && (this.crosshairPos = p.crosshair);
	}
}

class Coin extends GameObject {
	constructor(game, x, y) {
		super(game, x, y);
		this.graphics.beginFill("Yellow").drawCircle(0, 0, 25);
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

		//Setup Game Objects
		this.ships = {}
		this.shipInfo = {};
		/*this.player = new Ship(this, w / 2, 0);
		this.coins = [];

		//Setup Coins
		this.coinPos = generateCoins(100, { x: w - 200, y: h * 50 });
		for (let i = 0; i < this.coinPos.length; i += 2) {
			var coin = new Coin(this, this.coinPos[i] + 100, this.coinPos[i + 1] + w / 2);
			this.coins.push(coin);
		}*/

		//Setup Events
		window.onkeydown = this.inputDown.bind(this);
		window.onkeyup = this.inputUp.bind(this);
		this.stage.on("stagemousemove", this.mouseMove.bind(this));
	}

	login(ip) {
		var socket = io(ip);
		this.socket = socket;
		//connect
		socket.on('connect',function(){
			console.log("Connected to server")
		});
		//joinShip
		socket.on('joinShip',function(shipInfo) {
			console.log("joinShip",shipInfo);
			game.shipInfo.name = shipInfo.name;
			game.shipInfo.mode = shipInfo.mode;

			for(var i in shipInfo.ships) {
				game.addShip(shipInfo.ships[i])
			}
		});
		socket.on('addShip',game.addShip.bind(game));
		socket.on('removeShip',game.removeShip.bind(game));
		socket.on('moveShip',function(m) {
			console.log("moveShip",m);
			game.ships[m.name].updateCrumb(m);
		});
		socket.on('moveCrosshair',function(c) {
			console.log("moveCrosshair",c);
			game.ships[c.name].updateCrumb(c);
		});
	}

	addShip(s) {
		if(game.ships[s.name]) return;
		console.log("addShip",s);
		var ship = new Ship(this, s.name);
		ship.updateCrumb(s);
		game.ships[ship.name] = ship;
		if(ship.name == this.shipInfo.name) {
			ship.mode = this.shipInfo.mode;
			game.player=ship;
		}
	}

	removeShip(s) {
		console.log("removeShip",s);
		game.ships[s.name].destroy();
		delete game.ships[s.name];
	}


	update(e) {
		this.stage.canvas.width = window.innerWidth;
		this.stage.canvas.height = window.innerHeight

		//if(this.player) this.player.update();
		if(this.player) Object.values(this.ships).forEach(ship => { ship.update() })
		//this.coins.forEach(coin => { coin.update() })
		this.stage.update();
	}

	mouseMove(e) {
		if (!this.player||this.player.mode != 1) return;
		this.player.setCrosshairPos(e.stageX, e.stageY);
		this.socket.emit("moveCrosshair",this.player.crosshairPos);
	}

	inputDown(e) {
		if (!this.player||this.player.mode != 0) return;
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
		if(!(up==0&&down==0&&left==0&&right==0)) this.socket.emit("moveShip",{x:this.player.x,y:this.player.y,moving:this.player.moving});
	}

	inputUp(e) {
		if(!this.player) return
		console.log("INPUT: " + e.keyCode)
		switch (e.keyCode) {
			// Up (-X)
			case 38: // UP ARROW
			case 87: // W
				this.player.moving.up = 0;
				this.socket.emit("moveShip",{x:this.player.x,y:this.player.y,moving:this.player.moving});
				break;
			// Left (-Y)
			case 37: // Left Arrow
			case 65: // A
				this.player.moving.left = 0;
				this.socket.emit("moveShip",{x:this.player.x,y:this.player.y,moving:this.player.moving});
				break;
			// Down (+Y)
			case 40: // Down Arrow
			case 83: // S
				this.player.moving.down = 0;
				this.socket.emit("moveShip",{x:this.player.x,y:this.player.y,moving:this.player.moving});
				break;
			// Right (+X)
			case 39: // Right Arrow
			case 68: // D
				this.player.moving.right = 0;
				this.socket.emit("moveShip",{x:this.player.x,y:this.player.y,moving:this.player.moving});
				break;
		}
	}

	worldToLocalPos(x, y) {
		return {
			x,
			y: game.stage.canvas.height / 2 - (y - game.player.worldY) + game.player.physics.velocity.y
		}
	}

	localToWorldPos(x, y) {
		return {
			x,
			y: game.player.worldY + (game.stage.canvas.height / 2 - y - game.player.physics.velocity.y)
		}
	}
}

game = new Game("viewport", window.innerWidth, window.innerHeight);
game.login("https://tumble-boat-race.herokuapp.com")
//game.login("http://localhost:3000")