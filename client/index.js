const MULTIPLAYER = true;

game = new Game("viewport", window.innerWidth, window.innerHeight);

if(MULTIPLAYER) {
	game.join(location.hostname=="localhost"?"http://localhost:3000":"https://tumble-boat-race.herokuapp.com")
game.emit("joinGame",prompt("Username"));
} else {
	game.joinShip({
		name:"local",
		mode:-1,
		ships: [{
			name: "local",
			x: game.roomSize.w/2,
			y: game.roomSize.h-100,
			moving:  {
				up: 0,
				down: 0,
				left: 0,
				right: 0
			},
			crosshair: { x: 0, y: 0 }
		}]
	})
}