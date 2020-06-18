game = new Game("viewport", window.innerWidth, window.innerHeight);
game.join(location.hostname=="localhost"?"http://localhost:3000":"https://tumble-boat-race.herokuapp.com")
game.emit("joinGame",prompt("Username"));