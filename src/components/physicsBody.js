class PhysicsBody extends Component {
	constructor(gameObject) {
		super(gameObject);
		this.velocity = { x: 0, y: 0 };
		this.dampening = .035;
	}

	update() {
		this.gameObject.x += this.velocity.x;
		this.gameObject.y += this.velocity.y;
		this.velocity = lerpXY(this.velocity, ZERO_VECTOR, this.dampening);
	}
	addImpulse(x, y) {
		this.velocity.x += x;
		this.velocity.y += y;
	}
}