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
		this.setScale(.4);
		this.setPos(.99,.02);
	}

	mapPlayer(player) {
		this.newNode(player.x,player.y,"magenta",10);
	}
}