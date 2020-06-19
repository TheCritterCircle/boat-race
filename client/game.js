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

	getPos() {
		return{x:this.x,y:this.y}
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

	update() {
		this.physics.addImpulse(
			(this.moving.right - this.moving.left) * this.speed,
			( this.moving.down / 2 - this.moving.up) * this.speed// - .2
		);
		if(this.mode==1||this.mode==-1)this.setCrosshairPos(game.stage.mouseX,game.stage.mouseY);

		this.physics.update();
		this.y += this.ship.y;
		this.ship.y = 0;
		this.x += this.ship.x;
		this.ship.x = 0;
	}

	setCrosshairPos(x, y) {
		var mouse = this.globalToLocal(x,y);
		this.crosshair.x = mouse.x;
		this.crosshair.y = mouse.y;
	}

	getCrosshairPos() {
		return this.localToGlobal(this.crosshair.x,this.crosshair.y);
	}

	getCrumb(all) {
		if(all) {
			return {
				name: this.name,
				x: this.getPos().x,
				y: this.getPos().y,
				moving: this.moving,
				crosshair: this.getCrosshairPos()
			}
		}
		switch (this.mode) {
			case 0:
				return {
					name: this.name,
					mode: this.mode,
					x: this.getPos().x,
					y: this.getPos().y,
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
				x: this.getPos().x,
				y: this.getPos().y,
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
	constructor(game) {
		super();
		this.background = new createjs.Bitmap("media/background.png");
		this.addChild(this.background);

		//Properies
		this.size = {w:1920,h:5550};
		var screen = game.getSize();
		this.startY = this.size.h-screen.h/2;
		this.ships = {}
	}

	bind(action,ret) {
		if(ret) {
			return this[action].bind(this);
		}
		game.on(action,this[action].bind(this));
	}

	update() {
		Object.values(this.ships).forEach(ship => { ship.update() })

		var screen = game.getSize();
		var playerPos = game.player.getPos();
		this.x = screen.w/2-playerPos.x;
		this.y = screen.h/2-playerPos.y;

		var minY = screen.h-this.size.h;
		var minW = screen.w-this.size.w;
		if(this.y<minY) {
			this.y = minY;
		} else if(this.y>0) {
			this.y = 0;
		}
		if(this.x<minW) {
			this.x = minW;
		} else if(this.x>-minW) {
			this.x = -minW;
		}
	}

	reset() {
		game.hud.starting.visible = true;
		console.log("We be finding you a crew...")
		this.player = undefined;
		Object.values(this.ships).forEach(ship=>{ship.destroy()});
		this.ships = {};
		this.shipInfo = {};
	}

	joinShip(shipInfo) {
		game.hud.starting.visible = false
		console.log("joinShip",shipInfo);
		console.log("You are the",(shipInfo.mode==0?"Captain":"Cannon") + "!")
		game.shipInfo.name = shipInfo.name;
		game.shipInfo.mode = shipInfo.mode;

		for(var i in shipInfo.ships) {
			this.addShip(shipInfo.ships[i])
		}
	}

	moveShip(m) {
		console.log("moveShip",m);
		if(m.name == game.player.name&&game.player.mode ==0) return;
		this.ships[m.name].updateCrumb(m);
	}

	raceStart() {
		console.log("Race Start");

	}

	moveCrosshair(c) {
		console.log("moveCrosshair",c);
		this.ships[c.name].updateCrumb(c);
	}

	addShip(s) {
		if(this.ships[s.name]) return;
		console.log("addShip",s);
		var ship = new Player(this, s.name);
		ship.updateCrumb(s);
		this.ships[ship.name] = ship;
		if(ship.name == game.shipInfo.name) {
			ship.mode = game.shipInfo.mode;
			console.log(game.shipInfo.mode==0?(ship.cannon + ": Aye Aye Captain!"):(ship.captain + ": Ahoy Mateys!"))
			game.player=ship;
		}
		this.addChild(ship);
	}

	removeShip(s) {
		console.log("removeShip",s);
		if(!this.ships[s.name]) return;
		this.ships[s.name].destroy();
		delete this.ships[s.name];
	}
}

class UIMap extends createjs.Container {
	constructor(game) {
		super();
		this.nodes = new createjs.Container();
		this.addChild(this.nodes);
	}

	newNode(x,y,color,size,...p) {
		var node = new createjs.Shape();
		this.nodes.addChild(node);
		node.x = x;
		node.y = y;
		node.graphics.beginFill(color);
		var scale = 2/(this.scaleX + this.scaleY)
		this.createNodeShape(node.graphics,size*scale);
	}


	setScale(scale) {
		this.scaleX = scale*game.getSize().h/game.room.size.h;
		this.scaleY = scale*game.getSize().h/game.room.size.h;
	}

	setPos(x,y) {
		this.x = x*(game.getSize().w-this.scaleX*game.room.size.w);
		this.y = y*(game.getSize().h-this.scaleY*game.room.size.h);
	}

	update() {
		this.nodes.removeAllChildren();
		var ships = Object.values(game.room.ships).map(ship=>ship.getCrumb(true))
		ships.forEach(ship=>{
			this.mapPlayer(ship)
		});
	}
	
	mapPlayer(player) {
		this.newNode(player.x,player.y,"black");
	}

	createNodeShape(graphics,sizeLocal,...p) {
		graphics.drawCircle(0, 0, sizeLocal);
	}
}

class Minimap extends UIMap {
	constructor(game) {
		super(game);
		this.box = new createjs.Shape();
		this.addChild(this.box);
		this.box.graphics.beginFill("rgba(222,222,222,.7)").drawRect(0, 0, game.room.size.w,game.room.size.h);
		this.setChildIndex(this.box,0);
	}

	update() {
		super.update();
		this.setScale(.30);
		this.setPos(.99,.02);
	}

	mapPlayer(player) {
		this.newNode(player.x,player.y,"magenta",10);
	}
}

class HUD extends createjs.Container {
	constructor(game) {
		super();
		this.starting = new createjs.Container();
		this.addChild(this.starting);
		this.text = new createjs.Text("Waiting for 1 more player", "bold 50px Arial", "#ffffff");
		this.starting.addChild(this.text);
		this.outline = new createjs.Text("Waiting for 1 more player", "bold 50px Arial", "#000");
		this.starting.addChild(this.outline);
		this.outline.outline = 3

		this.minimap = new Minimap(game);
		this.addChild(this.minimap);
	}

	update() {
		this.minimap.update();
	}
}

class Game {
	constructor(i, w, h) {
		//Setup Stage
		this.stage = new createjs.Stage(i);
		this.stage.canvas.width = w;
		this.stage.canvas.height = h;
		//this.stage.canvas.style.cursor = "none";

		//Setup Game Loop
		createjs.Ticker.setFPS(60);
		createjs.Ticker.addEventListener("tick", this.update.bind(this));

		//Setup Game Objects
		this.room = new Room(this);
		this.stage.addChild(this.room);
		this.hud = new HUD(this);
		this.stage.addChild(this.hud);

		//Attributes
		this.shipInfo = {};

		//Setup Events
		window.onkeydown = this.inputDown.bind(this);
		window.onkeyup = this.inputUp.bind(this);
		this.stage.on("stagemousemove", this.mouseMove.bind(this));
	}

	getSize() {
		return {
			w:this.stage.canvas.width,
			h:this.stage.canvas.height
		}
	}

	//Socket Utils
	emit(...a) {
		this.socket&&(this.socket.emit(...a));
	}

	on(...a) {
		this.socket&&(this.socket.on(...a))
	}


	join(ip) {
		var socket = io(ip);
		this.socket = socket;
		//connect
		socket.on('connect',function(){
			console.log("Connected to server")
		});
		//joinShip
		var room = this.room;
		room.bind('joinShip');
		room.bind('addShip');
		room.bind('removeShip');
		socket.on('pending',room.bind('reset',true));
		room.bind('raceStart');
		room.bind('moveShip');
		room.bind('moveCrosshair');
	}


	//events
	update(e) {
		this.stage.canvas.width = window.innerWidth;
		this.stage.canvas.height = window.innerHeight
		this.player&&this.room.update();
		this.hud.update();
		this.stage.update();
	}

	mouseMove(e) {
		if (!this.player||(this.player.mode != 1&&this.player.mode != -1)) return;
		//this.player.setCrosshairPos(e.stageX-game.getSize().w/2, e.stageY-game.getSize().h/2);

		this.player.setCrosshairPos(e.stageX, e.stageY);
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
