var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var wsocket;
var isPlaying = false;

var name = "Lonely Snake";
var boneLength = 10;
var start = 0;
var snakes = [];
var foods = [];
var target = { x: 0, y: 0 };
var packettimer = 0;
var camera = { x: 0, y: 0, scale: 10,
	projectx: function(wx) { return (wx - this.x) / this.scale + canvas.width / 2; },
	projecty: function(wy) { return (wy - this.y) / this.scale + canvas.height / 2; },
	getworldx: function(px) { return (px - canvas.width / 2) * this.scale + this.x; },
	getworldy: function(py) { return (py - canvas.height / 2) * this.scale + this.y; } }

function frame(timestamp) {
	packettimer += timestamp - start;
	if (packettimer > 100) {
		wsocket.send(JSON.stringify(snakes[0]));
		sockangle = myangle;
		packettimer = 0;
	}

	var dt = (timestamp - start)/1000;
	start = timestamp;

	for (var i = 0; i < snakes.length; i++) {
		snakes[i].move(dt);
	}

	if (snakes.length > 0) {
		camera.x = snakes[0].bones[0].x;
		camera.y = snakes[0].bones[0].y;
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (var i = 0; i < foods.length; i++) {
		ctx.beginPath();
		ctx.arc(camera.projectx(foods[i].x), camera.projecty(foods[i].y), 2 / camera.scale, 0, Math.PI * 2);
		ctx.fill();
	}

	for (var i = 0; i < snakes.length; i++) {
		snakes[i].draw();
	}

	if (isPlaying === true) {
		requestAnimationFrame(frame);
	}
}

function Snake(hx, hy, bcount) {
	this.bones = [];
	this.direction = { x: 1, y: 0 };
	this.speed = 100;
	this.width = 5;
	for (var i = 0; i < bcount; i++) {
		this.bones.push({x: hx - i * boneLength, y: hy});
	}
}

Snake.prototype.move = function(dt) {
	this.bones[0].x = this.bones[0].x + this.speed * dt * this.direction.x;
	this.bones[0].y = this.bones[0].y + this.speed * dt * this.direction.y;
	for (var i = 1; i < this.bones.length; i++) {
		var dx = this.bones[i].x - this.bones[i - 1].x;
		var dy = this.bones[i].y - this.bones[i - 1].y;
		var ln = Math.sqrt(dx * dx + dy * dy);
		this.bones[i].x = this.bones[i - 1].x + dx * boneLength / ln;
		this.bones[i].y = this.bones[i - 1].y + dy * boneLength / ln;
	}
};

Snake.prototype.draw = function() {
	for (var i = 0; i < this.bones.length; i++) {
		ctx.beginPath();
		ctx.arc(camera.projectx(this.bones[i].x), camera.projecty(this.bones[i].y), this.width / camera.scale, 0, Math.PI * 2);
		ctx.fill();
	}
};

function sockonopen() {
	console.log('onopen');
	//wsocket.send('n' + name);
}

function sockonmessage(e) {
	console.log(e.data);
	var data = JSON.parse(e.data);

	for (var key in data) {
		if (key == "f") {
			foods = new Array(data.f.length / 2);
			for (var i = 0; i < foods.length; i++) {
				foods[i] = { id: i, x: data.f[i*2], y: data.f[i*2 + 1] };
			}
		} else if (key == "i") {
			snakes = [];
			snakes.push(new Snake(data.i.x, data.i.y, 5));
			myangle = sockangle = 0;
			if (isPlaying === false) {
				isPlaying = true;
				requestAnimationFrame(frame);
			}
		} else if (isNaN(key)) {
			// msg about player: key is id of the player
			var found = false;
			var foundID;
			for (var i = 0; i < snakes.length; i++) {
				if(snakes[i].id == key) {
					foundID = i;
					found = true;
					break;
				}
			}

			if (found == false) {
				snakes.push(new Snake(data[key].bones[0].x, data[key].bones[0].y, 5));
				foundID = snakes.length - 1;
				snakes[foundID].id = key;
			}

			snakes[foundID].bones = data[key].bones;
			snakes[foundID].direction = data[key].direction;
			snakes[foundID].speed = data[key].speed;
			snakes[foundID].width = data[key].width;
		} else {
			// msg about specific food
			foods[key] = data[key];
		}
	}
}

function sockonclose() {
	console.log('closed');
	isPlaying = false;
}

function play() {
	if (wsocket == null || wsocket.readyState === wsocket.CLOSED) {
		wsocket = new WebSocket("ws://192.168.1.101/");
		wsocket.onopen = sockonopen;
		wsocket.onclose = sockonclose;
		wsocket.onmessage = sockonmessage;
	}
}

canvas.onmousemove = function(e) {
	if (snakes.length > 0) {
		snakes[0].direction.x = camera.getworldx(e.offsetX) - snakes[0].bones[0].x;
		snakes[0].direction.y = camera.getworldy(e.offsetY) - snakes[0].bones[0].y;
		var ln = Math.sqrt(snakes[0].direction.x * snakes[0].direction.x + snakes[0].direction.y * snakes[0].direction.y);
		snakes[0].direction.x /= ln;
		snakes[0].direction.y /= ln;
		//myangle = Math.atan2(snakes[0].direction.y, snakes[0].direction.x);
	}
}