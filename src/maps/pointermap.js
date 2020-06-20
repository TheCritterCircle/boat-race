class Pointermap extends UIMap {
	constructor(game) {
		super(game);
	}

	mapPlayer(player) {
		var margin = 30;
		var screenSize = game.getSize();
		var userPos = game.player.getPos();
		var screenPos = game.room.localToGlobal(player.x,player.y);

        var y = screenPos.y;
		var x = screenPos.x;
		var scale = 0;
		if(y>screenSize.h||y <0||x>screenSize.w||x <0) {
			scale=20;
		}
		var right = x>screenSize.w;
		var left = x <0;
		var up = y <0;
		var down = y>screenSize.h

		if(right) {
			x=screenSize.w-margin;
		}
		if(left) {
			x=margin;
		}
		if(down) {
			y=screenSize.h-margin;
			dir=1
		}
		if(up) {
			y=margin;
		}
		var dir = Math.atan2(screenPos.y-y,screenPos.x-x)*180/Math.PI;
		console.log(dir)
		this.newNode(x,y,"magenta",scale,player.name,dir);
	}

	createNodeShape(sizeLocal,color,name,dir) {
		var node = new createjs.Container();
		var triangle = new createjs.Shape();
		node.addChild(triangle);
		triangle.graphics.beginFill(color).drawPolyStar(0, 0, sizeLocal,3,0,dir);

		var textContent = name||"Player";
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
