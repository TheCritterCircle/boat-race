game = new Game("viewport", window.innerWidth, window.innerHeight);
//game.join("https://tumble-boat-race.herokuapp.com");
//game.login("http://localhost:3000")
game.join(location.hostname=="localhost"?"http://localhost:3000":"https://tumble-boat-race.herokuapp.com")
game.emit("joinGame",prompt("Username"));