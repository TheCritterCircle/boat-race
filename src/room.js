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
		this.cannonballs = [];
	}

	bind(action,ret) {
		if(ret) {
			return this[action].bind(this);
		}
		game.on(action,this[action].bind(this));
	}

	update() {
		Object.values(this.ships).forEach(ship => { ship.update() })
		this.cannonballs.forEach(ship => { ship.update() })

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

	fire(player) {
		var cannonball = new CannonBall(game,player);
		this.addChild(cannonball);
		this.cannonballs.push(cannonball);
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