class GameObject extends createjs.Container {
	constructor(game, x=0, y=0) {
		super();
		this.game = game;
		this.x = x;
		this.y = y;
		console.log(this.constructor.name+" created")
	}

	update() {
		console.debug(this.constructor.name+" updated");
	}

	setPos(x, y) {
		this.x = x;
		this.y = y;
	}

	getPos() {
		return{x:this.x,y:this.y}
	}

	destroy() {
		console.log(this.constructor.name+" destroyed")
		this.parent.removeChild(this);
	}
}
