const
	ZERO_VECTOR = { x: 0, y: 0 }
DEBUG = true
{
	var oldLog = console.log;
	console.log = (...data) => {
		if (DEBUG) oldLog(...data);
	}
}

function lerpXY(a, b, t) {
	return {
		x: a.x + t * (b.x - a.x),
		y: a.y + t * (b.y - a.y)
	}
}

function generateCoins(n, bounds) {
	var pos = [];
	for (let i = 0; i < n; i++) {
		pos.push(Math.random() * bounds.x);
		pos.push(Math.random() * bounds.y);
	}
	return pos;
}

function centerText (text) {
var b = text.getBounds();
	text.x += - (b.width/2); 
}
