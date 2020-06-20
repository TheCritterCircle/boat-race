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
