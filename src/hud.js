class HUD extends createjs.Container {
	constructor(game) {
		super();
		this.starting = new createjs.Container();
		this.addChild(this.starting);
		this.text = new createjs.Text("Waiting for 1 more player", "bold 50px Arial", "#ffffff");
		this.starting.addChild(this.text);
		this.outline = new createjs.Text("Waiting for 1 more player", "bold 50px Arial", "#000");
		this.starting.addChild(this.outline);
		this.outline.outline = 3

		this.minimap = new Minimap(game);
		this.addChild(this.minimap);

		this.pointermap = new Pointermap(game);
		this.addChild(this.pointermap);
	}

	splash(text) {
		
	}

	update() {
		this.minimap.update();
		this.pointermap.update();
	}
}