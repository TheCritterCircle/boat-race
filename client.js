const
	ZERO_VECTOR = {x:0,y:0}
	DEBUG = true
{
	var oldLog = console.log;
	console.log = (...data)=>{
		if(DEBUG) oldLog(...data);
	}
}

var game;

function lerpXY(a,b,t) {
	return {
		x:a.x+t*(b.x-a.x),
		y:a.y+t*(b.y-a.y)
	}
}

function generateCoins(n,bounds) {
	var pos = [];
	for (let i = 0; i < n; i++) {
		pos.push(Math.random()*bounds.x);
		pos.push(Math.random()*bounds.y);		
	}
	return pos;
}

class Component {
	constructor(gameObject) {
		this.gameObject = {worldX:0,worldY:0};
		gameObject&&(this.gameObject = gameObject);
	}
}

class PhysicsBody extends Component {
	constructor(gameObject) {
		super(gameObject);
		this.velocity = {x:0,y:0};
		this.dampening = .035;
	}

	update() {
		this.gameObject.worldX += this.velocity.x;
		this.gameObject.worldY += this.velocity.y;
		this.velocity = lerpXY(this.velocity,ZERO_VECTOR,this.dampening);
	}
	addImpulse(x,y) {
		this.velocity.x += x;
		this.velocity.y += y;
	}
}

class GameObject extends createjs.Shape {
	constructor(game,x,y) {
		super();
		this.worldX = x;
		this.worldY = y;
		this.x = 0;
		this.y = 0;
		game.stage.addChild(this);
	}

	update() {
		var pos = game.worldToLocalPos(this.worldX,this.worldY)
		this.x = pos.x;
		this.y = pos.y;
	}

	setPos(x,y) {
		this.worldX = x;
		this.worldY = y;
	}
}
class Crosshair extends GameObject {
	constructor(game,x,y) {
		super(game,x,y);
		this.graphics.beginFill("Green").drawCircle(0,0,20);
	}
}

class Player extends GameObject {
	constructor(game,x,y) {
		super(game,x,y);
		this.pair = "hello";
		this.mode = 0;
		this.graphics.beginFill("DeepSkyBlue").drawCircle(0,0,50);
		this.speed = .3
		this.moving = {up:0,down:0,left:0,right:0};
		this.crosshairPos = {x:0,y:0};

		//Child GameObjects
		this.crosshair = new Crosshair(game,x,y);

		// Components
		this.physics = new PhysicsBody(this);
	}

	setCrosshairPos(x,y) {
		this.crosshairPos = {x,y};
	}

	update() {
			this.physics.addImpulse(
				(this.moving.right-this.moving.left)*this.speed,
				(this.moving.up-this.moving.down/2)*this.speed+.2
			);
		this.physics.update();
		super.update();
		this.crosshair.worldX = this.crosshairPos.x;
		this.crosshair.worldY = this.worldY-this.crosshairPos.y +this.stage.canvas.height/2;
		this.crosshair.update();
	}

	getCrumb() {
		switch(this.mode) {
			case 0:
				return {
					pair:this.pair,
					mode:this.mode,
					x:this.worldX,
					y:this.worldY,
					moving: this.moving
				}
			case 1:
				return {
					pair:this.pair,
					mode:this.mode,
					crosshair:this.crosshairPos
				}
			}
	}

	updateCrumb(p) {
		this.setPos(p.x,p.y);
		this.moving = p.moving;
		this.crosshairPos = this.crosshair;
	}
}

class Coin extends GameObject {
	constructor(game,x,y) {
		super(game,x,y);
		this.graphics.beginFill("Yellow").drawCircle(0,0,25);
	}
}

class Game {
	constructor(i,w,h) {
		//Setup Stage
		this.stage = new createjs.Stage(i);
		this.stage.canvas.width = w;
		this.stage.canvas.height = h;

		//Setup Game Loop
		createjs.Ticker.setFPS(60);
		createjs.Ticker.addEventListener("tick",this.update.bind(this));

		//Setup Game Objects
		this.player = new Player(this,w/2,0);
		this.coins = [];

		//Setup Coins
		this.coinPos = generateCoins(100,{x:w-200,y:h*50});
		for (let i = 0; i < this.coinPos.length; i+=2) {
			var coin = new Coin(this,this.coinPos[i]+100,this.coinPos[i+1]+w/2);
			this.coins.push(coin);
		}

		//Setup Events
		window.onkeydown = this.inputDown.bind(this);
		window.onkeyup = this.inputUp.bind(this);
		this.stage.on("stagemousemove", this.mouseMove.bind(this));
	}

	update(e) {
		this.stage.canvas.width = window.innerWidth;
		this.stage.canvas.height = window.innerHeight

		this.player.update();
		this.coins.forEach(coin=>{coin.update()})
		this.stage.update();
	}

	mouseMove(e) {
		if(this.player.mode!=1) return;
		this.player.setCrosshairPos(e.stageX,e.stageY);
	}

	inputDown(e) {
		if(this.player.mode!=0) return;
		console.log("INPUT: "+e.keyCode)
		switch(e.keyCode) {
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
	}

	inputUp(e) {
		console.log("INPUT: "+e.keyCode)
		switch(e.keyCode) {
			// Up (-X)
			case 38: // UP ARROW
			case 87: // W
				this.player.moving.up = 0;
				break;
			// Left (-Y)
			case 37: // Left Arrow
			case 65: // A
				this.player.moving.left = 0;
				break;
			// Down (+Y)
			case 40: // Down Arrow
			case 83: // S
				this.player.moving.down = 0;
				break;
			// Right (+X)
			case 39: // Right Arrow
			case 68: // D
				this.player.moving.right = 0;
				break;
		}	
	}

	worldToLocalPos(x,y) {
		return {
			x,
			y:game.stage.canvas.height/2-(y-game.player.worldY)+game.player.physics.velocity.y
		}
	}

	localToWorldPos(x,y) {
		return {
			x,
			y:game.player.worldY + (game.stage.canvas.height/2-y-game.player.physics.velocity.y)
		}
	}
}

game = new Game("viewport",window.innerWidth,window.innerHeight);