class Pointermap extends UIMap {
	constructor(game) {
		super(game);
	}

	mapPlayer(player) {
		var margin = 30
			, screenSize = game.getSize()
			, screenPos = game.room.localToGlobal(player.x, player.y)
			, y = screenPos.y
			, x = screenPos.x
			, scale = 0;
		// If Outside Screen
		(y > screenSize.h || y < 0 || x > screenSize.w || x < 0) && (scale = 20);
		// Right
		x > screenSize.w && (x = screenSize.w - margin);
		// Left
		x < 0 && (x = 30);
		// Up
		y < 0 && (y = margin, dir = 1);
		// Down
		y > screenSize.h && (y = screenSize.h - margin);
		// Point Arrow Towards Player
		var dir = 180 * Math.atan2(screenPos.y - y, screenPos.x - x) / Math.PI;
		this.newNode(x, y, "magenta", scale, player.name.replace("-","&"), dir)
	}

	createNodeShape(sizeLocal, color, name, dir) {
		var node = new createjs.Container();
		var triangle = new createjs.Shape();
		node.addChild(triangle);
		triangle.graphics.beginFill(color).drawPolyStar(0, 0, sizeLocal, 3, 0, dir);

		var textContent = name || "Player";
		var text = new createjs.Text(textContent, "bold 20px Arial", "#ffffff");
		node.addChild(text);
		centerText(text);
		var outline = new createjs.Text(textContent, "bold 20px Arial", "#000");
		node.addChild(outline);
		centerText(outline);
		outline.outline = 1.1;
		return node;
	}
}
