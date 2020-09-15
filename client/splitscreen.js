
/**
 * Splitscreen JS
 * @author tumble1999
 */

class SplitScreen {
	constructor(container) {
		this.container = container;
		this.container.style.display = "flex";
		this.container.style["flex-direction"] = "row";
		this.container.style["flex-wrap"] = "wrap";
		this.container.style["align-content"] = "stretch";
		this.container.style["align-item"] = "stretch";
	}

	setDirection(dir) {
		switch (dir||"vertical") {
			case "horizontal":
				container.style["flex-direction"] = "column";
				break;
			case "vertical":
				this.container.style["flex-direction"] = "row";
			break;
		}
	}
	
	getCanvases() {
		return Array.from(this.container.getElementsByTagName("canvas"));
	}

	update() {
		var canvases = this.getCanvases();
		var percent = 100 / Math.ceil(Math.sqrt(canvases.length)) + "%";
		this.getCanvases().forEach(canvas=>{
			delete canvas.removeAttribute("width");
			delete canvas.removeAttribute("height");
			canvas.style.flex = "1 0 " + percent;
			setTimeout(()=>{
				canvas.width = canvas.getBoundingClientRect().width;
				canvas.height = canvas.getBoundingClientRect().height;
			},0)
			/**/
		})
	}

	createScreen() {
		var canvas = document.createElement("canvas");
		this.container.appendChild(canvas);
		this.update();
		return canvas;
	}
}
