class UIMap extends createjs.Container {
	constructor(game) {
		super();
		this.game = game;
		this.nodes = new createjs.Container();
		this.addChild(this.nodes);
	}

	newNode(x,y,color,size,...p) {
		var scale = 2/(this.scaleX + this.scaleY)
		var node = this.createNodeShape(size*scale,color,...p)
		this.nodes.addChild(node);
		node.x = x;
		node.y = y;
	}


	setScale(scale) {
		this.scaleX = scale*this.game.getSize().h/this.game.room.size.h;
		this.scaleY = scale*this.game.getSize().h/this.game.room.size.h;
	}

	setPos(x,y) {
		this.x = x*(this.game.getSize().w-this.scaleX*this.game.room.size.w);
		this.y = y*(this.game.getSize().h-this.scaleY*this.game.room.size.h);
	}

	update() {
		this.nodes.removeAllChildren();
		var ships = Object.values(this.game.room.ships).map(ship=>ship.getCrumb(true))
		ships.forEach(ship=>{
			this.mapPlayer(ship)
		});
	}
	
	mapPlayer(player) {
		this.newNode(player.x,player.y,"black");
	}

	createNodeShape(sizeLocal,color,...p) {
		var node = new createjs.Shape();
		node.graphics.beginFill(color).drawCircle(0, 0, sizeLocal);
		return node;
	}
}