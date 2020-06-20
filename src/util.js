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

function vec(...p) {
	return 1 == p.length ? "object" == typeof p[0] ? Object.values(p[0]) : p[0] : p
}

function mag2(...p) {
    return (p = vec(...p)).reduce((e,i)=>e + i * i, 0)
}

function mag(...p) {
	return Math.sqrt(mag2(...p));
}

function norm(...p) {
	p = vec(...p);
	var length = mag(...p);
	return p.map(i=>i/length);
}

function collided(a,b) {
	var aBounds = a.getBounds();
	var bBounds = b.getBounds();
	if 	(aBounds.x >= bBounds.x + bBounds.width 
		|| aBounds.x + aBounds.width <= bBounds.x 
		|| aBounds.y >= bBounds.y + bBounds.height 
		|| aBounds.y + aBounds.height <= bBounds.y ) return false;
    return true;
}
