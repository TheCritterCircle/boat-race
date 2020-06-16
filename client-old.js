var game,
	DEBUG = true;
{
	var oldLog = console.log;
	console.log = (...t)=> {
		if(DEBUG) oldLog(...t);
	}
}

const ZERO_VECTOR = {x:0,y:0};

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


class PhysicsBody {
	constructor(game,gameObject) {
		this.gameObject = {x:0,y:0};
		gameObject&&(this.gameObject = gameObject);
		this.velocity = {x:0,y:0};
		this.dampening = .035;
	}

	update(x,y) {
		x&&(this.gameObject.x = x);
		y&&(this.gameObject.y = y);
		this.gameObject.x += this.velocity.x;
		this.gameObject.y += this.velocity.y;
		this.velocity = lerpXY(this.velocity,ZERO_VECTOR,this.dampening);
		return this.gameObject;
	}

	addImpulse(x,y) {
		this.velocity.x += x;
		this.velocity.y += y;
	}
}

class BoundToWorld {
	constructor(game,gameObject) {
		this.gameObject = {x:0,y:0};
		gameObject&&(this.gameObject = gameObject);

		this.lastGameY = game.gameY;
	}

	update() {
		this.gameY = game.gameY;
		this.gameObject.y += this.gameY - this.lastGameY;
	}
}

class GameObject extends createjs.Shape {
	constructor(game,x,y) {
		super();
		this.x = x;
		this.y = y;
		game.stage.addChild(this);

		// Components
		this.physics = new PhysicsBody(game,this);
	}

	update() {
		this.physics.update();
	}

	setWorldPos(x,y,game=window.game) {
		var pos = game.worldToLocalPos(x,y);
		this.x = pos.x;
		this.y = pos.y;
	}
}

class Player extends GameObject {
	constructor(game,x,y) {
		super(game,x,y);
		this.graphics.beginFill("DeepSkyBlue").drawCircle(0,0,50);
		this.speed = .3
		this.moving = {up:0,down:0,left:0,right:0};
	}

	update() {
		if(!(this.moving==0&&this.moving==0)) {
			this.physics.addImpulse(
				(this.moving.right-this.moving.left)*this.speed,
				(this.moving.down-this.moving.up)*this.speed
			);
		}
		super.update();
	}
}

class Coin extends GameObject {
	constructor(game,x,y) {
		super(game,x,y);
		this.graphics.beginFill("Yellow").drawCircle(0,0,25);

		// Components
		this.worldBound = new BoundToWorld(game,this);
	}
	update() {
		this.worldBound.update();

		super.update();
	}
}

class Game {
	constructor(i,w,h) {
		this.stage = new createjs.Stage(i);
		this.stage.canvas.width = w;
		this.stage.canvas.height = h;

		createjs.Ticker.setFPS(60);
		createjs.Ticker.addEventListener("tick",this.update.bind(this));

		// Properties
		this.gameY = 0;
		this.gameSpeed = 5;

		// Objects
		this.player = new Player(this,w/2,h/2);
		this.coins = [];

		//Setup Coins
		this.coinPos = generateCoins(100,{x:w,y:h*100});
		for (let i = 0; i < this.coinPos.length; i+=2) {
			var coin = new Coin(this,0,0);
			coin.setWorldPos(this.coinPos[i],this.coinPos[i+1],this);
			this.coins.push(coin);

		}

		//Events
		window.onkeydown= this.inputDown.bind(this);
		window.onkeyup = this.inputUp.bind(this);
		
	}

	update(e) {
		this.gameSpeed = 5*(1-this.player.y/this.stage.canvas.height);
		this.gameY +=  this.gameSpeed;
		this.player.update();
		this.coins.forEach(coin=>{coin.update()})
		this.stage.update();
	}

	inputDown(e) {
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
			y: this.stage.canvas.height-y-this.gameY
		}
	}

	localToWorldPos(x,y) {
		return {
			x,
			y: this.stage.canvas.height-this.gameY+y,
		}
	}

	getWorldPos(gameObject) {
		return this.localToWorldPos(gameObject.x,gameObject.y);
	}

	getPlayerWorldPos() {
		return this.getWorldPos(this.player);
	}
}


game = new Game("viewport",window.innerWidth,window.innerHeight);