class CannonBall extends GameObject {
	constructor(game,player) {
		super(game,...Object.values(player.getPos()));
		this.cannonBallGraphic = new createjs.Shape();
		this.addChild(this.cannonBallGraphic);
		this.cannonBallGraphic.graphics.beginFill("black").drawCircle(0, 0, 100);

		var target = player.crosshair.localToLocal(0,0,game.room);
		var dist = norm({
			x:target.x-player.x,
			y:target.y-player.y
		});
		this.dir = {
			x:dist[0],
			y:dist[1]
		}
	}

	update() {
		this.x +=this.dir.x;
		this.y+=this.dir.y;
	}
}