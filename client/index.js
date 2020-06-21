game = new Game("viewport", window.innerWidth, window.innerHeight);

game.join(location.hostname=="localhost"?"http://localhost:3000":"https://tumble-boat-race.herokuapp.com")
game.emit("joinGame",prompt("Username"));

// One Player Mode
/*game.room.joinShip({
	name:"local",
	mode:-2,
	ships: [{
		name: "local",
		x: game.room.size.w/2,
		y: game.room.size.h-100,
		moving:  {
			up: 0,
			down: 0,
			left: 0,
			right: 0
		},
		crosshair: { x: 0, y: 0 }
	}]
})*/
