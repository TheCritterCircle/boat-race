var splitscreen = new SplitScreen(document.body);

var games = [];
/*var game = new Game(splitscreen.createScreen());

game.join(location.hostname=="localhost"?"http://localhost:3000":"https://tumble-boat-race.herokuapp.com")
game.emit("joinGame",prompt("Username"));*/

function createGame() {
	var game = new Game(splitscreen.createScreen());
	
	game.join(location.hostname=="localhost"?"http://localhost:3000":"https://tumble-boat-race.herokuapp.com")
	game.emit("joinGame",prompt("Username"));
	games.push(game);

}
function update() {
	// game.update();
	games.forEach(g=>{g.update();})
}

createGame();
		
//Setup Game Loop
createjs.Ticker.setFPS(60);
createjs.Ticker.addEventListener("tick", update);

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
