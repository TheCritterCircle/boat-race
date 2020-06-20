class CannonBall extends GameObject {
	constructor(game,player) {
		super(game,...Object.values(player.getPos()));

		
	}
}