class CannonBall extends GameObject {
	constructor(game,player) {
		super(game,...Object.values(player.getPos()));
		this.cannonBallGraphic = new createjs.Shape();
		this.addChild(this.cannonBallGraphic);
		this.radius = 15;
		this.cannonBallGraphic.graphics.beginFill("black").drawCircle(0, 0, this.radius);
		this.owner = player;

		/*var target = player.crosshair//.localToLocal(0,0,game.room);
		var dist = norm({
			x:target.x-player.x,
			y:target.y-player.y
		});*/
		var dist = norm(player.getCrosshairPos());
		this.dir = {
			x:dist[0],
			y:dist[1]
		}
		//this.setBounds(0,0,this.radius,this.radius)
	}

	update(players) {
		super.update();
		var speed = 15;
		this.x +=this.dir.x*speed;
		this.y+=this.dir.y*speed;
		this.setBounds(this.x,this.y,this.radius*2,this.radius*2)

		var t = this;
		players.forEach(p => {
			if(p.name==this.owner.name||!collided(t,p)) return;
			game.room.removeCannonball(this);
		});

		if(!collided(this,game.room)) {
			game.room.removeCannonball(this);
		}
	}
}