class Coin extends GameObject {
	constructor(game, x, y) {
		super(game, x, y);
		this.coinGraphic = new createjs.Shape();
		this.coinGraphic.graphics.beginFill("Yellow").drawCircle(0, 0, 25);
		this.addChild(this.coinGraphic);
	}
}