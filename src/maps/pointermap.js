class Pointermap extends UIMap {
	constructor(game) {
		super(game);
	}

	mapPlayer(player) {
		var margin = 30;
		var y = player.y>game.player.y?game.room.size.h-margin:margin
		var flip = Math.sign(y-game.room.size.h/2)
		this.newNode(player.x,y,"magenta",flip*20,player.name);
	}

	createNodeShape(sizeLocal,color,name) {
		var node = new createjs.Container();
		var triangle = new createjs.Shape();
		node.addChild(triangle)
		triangle.graphics.beginFill(color).drawPolyStar(0, 0, sizeLocal,3,0,90);

		var textContent = name||"Player"
		
		var text = new createjs.Text(textContent, "bold 20px Arial", "#ffffff");
		node.addChild(text);
		centerText(text);
		var outline = new createjs.Text(textContent, "bold 20px Arial", "#000");
		node.addChild(outline);
		centerText(outline);
		outline.outline = 1.1
		return node;
	}
}
