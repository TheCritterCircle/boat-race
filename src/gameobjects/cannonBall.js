class CannonBall extends GameObject {
	constructor(game,player) {
		super(game,...Object.values(player.getPos()));
		this.cannonBallGraphic = new createjs.Shape();
		this.addChild(this.cannonBallGraphic);
		this.cannonBallGraphic.graphics.beginFill("black").drawCircle(0, 0, 100);

		
	}
}