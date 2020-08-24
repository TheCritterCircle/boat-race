class Text extends createjs.Container {
	constructor(text,options={}) {
		super();
		var default_options = {font:"Arial",fill:{size:20,color:"#ffffff"},outline:{size:3,color:"#000000"}};
		options.fill = Object.assign(default_options.fill,options.fill);
		options.outline = Object.assign(default_options.outline,options.outline);
		options = Object.assign(default_options,options);
		this.fill = new createjs.Text(text,`bold ${options.fill.size}px ${options.font}`,options.fill.color);
		this.addChild(this.fill);
		this.outline = new createjs.Text(text,`bold ${options.fill.size}px ${options.font}`,options.outline.color);
		this.addChild(this.outline);
		this.outline.outline = options.outline.size;
	}

	setText(text) {
		this.fill.text = this.outline.text = text;
	}
}