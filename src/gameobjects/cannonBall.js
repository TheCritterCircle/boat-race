class CannonBall extends GameObject {
	constructor(game,player) {
		super(game,...Object.values(player.getPos()));
		this.cannonBallGraphic = new createjs.Shape();
		this.radius = 15;
		this.cannonBallGraphic.graphics.beginFill("black").drawCircle(0, 0, this.radius);
		this.owner = player;

		/*var target = player.crosshair//.localToLocal(0,0,this.game.room);
		var dist = norm({
			x:target.x-player.x,
			y:target.y-player.y
		});*/
		var dist = norm(player.getCrosshairPos());
		this.dir = {
			x:dist[0],
			y:dist[1]
		}
		this.setBounds(0,0,this.radius,this.radius)
		this.ready = false;
	}

	update(players) {
		super.update();
		var speed = 15;
		this.x +=this.dir.x*speed;
		this.y+=this.dir.y*speed;
		//this.setBounds(this.x,this.y,this.radius*2,this.radius*2)

		if(!collided(this,this.game.room)) {
			console.log("cannon out of stage")
			this.game.room.removeCannonball(this);
		}
		if(!collided(this,this.owner)&&!this.ready) {
			this.addChild(this.cannonBallGraphic);
			this.ready=false;
		}
		if(!this.ready) return;
		var t = this;
		players.forEach(p => {
			if(p.name==this.owner.name||!collided(t,p)) return;
			this.game.room.removeCannonball(this);
		});

	}
}