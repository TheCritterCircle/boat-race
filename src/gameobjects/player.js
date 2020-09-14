class Player extends GameObject {
	constructor(game,name,x=0,y=0) {
		super(game,x,y);
		this.name = name;
		this.mode = -1;
		this.speed = .3
		this.moving = { up: 0, down: 0, left: 0, right: 0 };
		this.screen = [];
		this.screen.length = [];

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

		//Target line
			this.targetLine = new createjs.Shape();
			this.addChild(this.targetLine);
			this.targetLine.graphics.setStrokeStyle(1).beginStroke("rgba(0,0,0,1)");
			this.targetLine.startPoint = this.targetLine.graphics.moveTo(0,0).command;
			var ch = this.getCrosshairPos();
			this.targetLine.endPoint = this.targetLine.graphics.lineTo(ch.x,ch.y).command;
			this.targetLine.graphics.endStroke();

		// Components
		this.physics = new PhysicsBody(this.ship);
	}

	update() {
		super.update();
		this.setBounds(this.x,this.y,40,40)
		this.physics.addImpulse(
			(this.moving.right - this.moving.left) * this.speed,
			( this.moving.down / 2 - this.moving.up) * this.speed// - .2
		);
		if(this.mode>-1)this.screen[this.mode] = game.getScreenBounds();
		//if(this.mode==1)this.setCrosshairPos(game.stage.mouseX,game.stage.mouseY);
		this.physics.update();
		this.y += this.ship.y;
		this.x += this.ship.x;
		this.ship.y = 0;
		this.ship.x = 0;
	}

	getPos() {
		return this.ship.localToLocal(0,0,game.room);
	}

	setCrosshairPos(x, y) {
		this.crosshair.x = this.targetLine.endPoint.x = x;
		this.crosshair.y = this.targetLine.endPoint.y = y;
		var cannonPos = this.getActiveCannonPos();

		this.targetLine.startPoint.x = cannonPos.x;
		this.targetLine.startPoint.y = cannonPos.y;
	}

	getActiveCannonPos() {
		var cannons = [
			{x:-20,y:-20},
			{x:-20,y:20},
			{x:20,y:20},
			{x:20,y:-20}
		]
		var ch = this.getCrosshairPos();
		var angle = Math.atan2(ch.x,ch.y)+Math.PI;
		var id = Math.floor((angle*cannons.length)/(2*Math.PI));
		return cannons[id];
	}

	getCrosshairPos() {
		return {
			x: this.crosshair.x,
			y: this.crosshair.y
		}
	}

	getCrumb(all) {
		if(all) {
			return {
				name: this.name,
				x: this.getPos().x,
				y: this.getPos().y,
				moving: this.moving,
				screen:this.screen,
				crosshair: this.getCrosshairPos()
			}
		}
		switch (this.mode) {
			case 0:
				return {
					id:this.id,
					name: this.name,
					mode: this.mode,
					x: this.getPos().x,
					y: this.getPos().y,
					screen: this.screen,
					moving: this.moving
				}
			case 1:
				return {
					id:this.id,
					name: this.name,
					mode: this.mode,
					screen: this.screen,
					crosshair: this.getCrosshairPos()
				}
			default: 
			return {
				id:this.id,
				name: this.name,
				mode: this.mode,
				x: this.getPos().x,
				y: this.getPos().y,
				moving: this.moving,
				screen: this.screen,
				crosshair: this.getCrosshairPos()
			}
		}
	}

	updateCrumb(p) {
		p.id && (this.id = p.id);
		p.name && (this.name = p.name);
		p.mode && (this.mode = p.mode);
		p.captain && (this.captainNickname.text = this.captain = p.captain)&&centerText(this.captainNickname);
		p.cannon && (this.cannonNickname.text = this.cannon = p.cannon)&&centerText(this.cannonNickname);
		p.screen && (this.screen = p.screen);
		p.x && p.y && this.setPos(p.x, p.y);
		p.moving && (this.moving = p.moving);
		p.crosshair && this.setCrosshairPos(p.crosshair.x,p.crosshair.y);
	}
}