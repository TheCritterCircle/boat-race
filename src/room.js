class Room extends createjs.Container {
	constructor(game) {
		super();
		this.game = game;
		this.background = new createjs.Bitmap("media/background.png");
		this.addChild(this.background);

		//Properies
		this.size = {w:1920,h:5550};
		//this.setBounds(x,y,width,height);
		var screen = this.game.getSize();
		this.startY = this.size.h-screen.h/2;
		this.ships = {}

		this.setBounds(0,0,this.size.w,this.size.h)
		this.cannonballs = [];
	}

	bind(action,ret) {
		if(ret) {
			return this[action].bind(this);
		}
		this.game.on(action,this[action].bind(this));
	}

	update() {
		Object.values(this.ships).forEach(ship => { ship.update() })
		this.cannonballs.forEach(cb => { cb.update(Object.values(this.ships)) })

		var screen = this.game.getSize();
		var playerPos = this.game.player.getPos();
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
		} else if(this.x>0) {
			this.x = 0;
		}
	}

	reset() {
		this.game.hud.starting.visible = true;
		console.log("We be finding you a crew...")
		this.player = undefined;
		delete this.player;
		Object.values(this.ships).forEach(ship=>{ship.destroy()});
		this.ships = new Object;
		this.shipInfo = new Object;
	}

	fire(player) {
		console.log("fire",player);
		var cannonball = new CannonBall(this.game,this.game.room.ships[player.id||player.name]);
		this.addChild(cannonball);
		this.cannonballs.push(cannonball);
		if(this.cannonballs.length>10*Object.keys(this.ships).length) {
			this.removeCannonball(this.cannonballs[0]);
		}
	}

	removeCannonball(cannonball) {
		var i = this.cannonballs.indexOf(cannonball);
		if(i>-1) {
			cannonball.destroy();
			this.cannonballs.splice(i,1);
		}
	}

	joinShip(shipInfo) {
		this.game.hud.starting.visible = false
		console.log("joinShip",shipInfo);
		console.log("You are the",(shipInfo.mode==0?"Captain":"Cannon") + "!")
		this.game.shipInfo.id = shipInfo.id;
		this.game.shipInfo.name = shipInfo.name;
		this.game.shipInfo.mode = shipInfo.mode;

		for(var i in shipInfo.ships) {
			this.addShip(shipInfo.ships[i])
		}
	}

	moveShip(m) {
		console.log("moveShip",m);
		if(m.name == this.game.player.name&&this.game.player.mode ==0) return;
		this.ships[m.id||m.name].updateCrumb(m);
	}

	raceStart() {
		console.log("Race Start");

	}

	moveCrosshair(c) {
		console.log("moveCrosshair",c);
		this.ships[c.id||c.name].updateCrumb(c);
	}

	addShip(s) {
		if(this.ships[s.id||s.name]) return;
		console.log("addShip",s);
		var ship = new Player(this.game, s.name);
		ship.updateCrumb(s);
		this.ships[ship.id||ship.name] = ship;
		this.addChild(ship);
		if(!this.game.player && 
			(
				ship.id && this.game.shipInfo.id==ship.id
			||	ship.name && this.game.shipInfo.name==ship.name
			)) {
			ship.id = this.game.shipInfo.id;
			ship.mode = this.game.shipInfo.mode;
			console.log(this.game.shipInfo.mode==0?(ship.cannon + ": Aye Aye Captain!"):(ship.captain + ": Ahoy Mateys!"))
			this.game.player=ship;
		}
	}

	removeShip(s) {
		console.log("removeShip",s);
		if(!this.ships[s.id||s.name]) return;
		this.ships[s.name].destroy();
		delete this.ships[s.id||s.name];
	}
}