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
		window.onkeydown = this.bindEvent("inputDown");
		window.onkeyup = this.bindEvent("inputUp");
		this.stage.on("stagemousemove", this.bindEvent("mouseMove"));
		this.stage.on("stagemousedown",this.bindEvent("mouseClick"));
	}

	bindEvent(f) {
		return this[f].bind(this);
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

	mouseClick(e) {

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