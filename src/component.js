class Component {
	constructor(gameObject) {
		this.gameObject = { worldX: 0, worldY: 0 };
		gameObject && (this.gameObject = gameObject);
	}
}