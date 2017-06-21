var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var boneLength = 10;
var boneWidth = 5;
var bones = [];
var target = { x: 0, y: 0 };
var speed = 200;

var foods = [];

var start = 0;

var solveBoneIK = function(tx, ty) {
	bones[0].x = tx;
	bones[0].y = ty;

	for (var i = 1; i < bones.length; i++) {
		var dx = bones[i].x - bones[i - 1].x;
		var dy = bones[i].y - bones[i - 1].y;
		var ln = Math.sqrt(dx * dx + dy *dy);
		bones[i].x = bones[i - 1].x + (dx * boneLength) / ln;
		bones[i].y = bones[i - 1].y + (dy * boneLength) / ln;
	}
}

var frame = function(timestamp) {
	var dt = (timestamp - start) / 1000;
	start = timestamp;

	var dx = target.x - bones[0].x;
	var dy = target.y - bones[0].y;
	var ln = Math.sqrt(dx * dx + dy * dy);
	if (ln > 5) {
		dx *= dt;
		dy *= dt;
		dx = bones[0].x + (dx * speed) / ln;
		dy = bones[0].y + (dy * speed) / ln;
		solveBoneIK(dx, dy);
	}

	ctx.clearRect(0, 0, 800, 600);

	for (var i = 0; i < foods.length; i++) {
		ctx.beginPath();
		ctx.arc(foods[i].x, foods[i].y, 2, 0, Math.PI * 2);
		ctx.fill();

		var fx = bones[0].x - foods[i].x;
		var fy = bones[0].y - foods[i].y
		if ((fx * fx + fy * fy) < (boneWidth * boneWidth)) {
			foods[i].x = 800 * Math.random();
			foods[i].y = 600 * Math.random();
			boneWidth += 0.1;
			bones.push({x: bones[bones.length-1].x, y: bones[bones.length-1].y});
		}
	}

	/*ctx.beginPath();
	ctx.moveTo(bones[0].x, bones[0].y);
	for (var i = 1; i < bones.length; i++) {
		ctx.lineTo(bones[i].x, bones[i].y);
	}
	ctx.lineWidth = boneWidth;
	ctx.stroke();*/

	for (var i = 0; i < bones.length; i++) {
		ctx.beginPath();
		ctx.arc(bones[i].x, bones[i].y, boneWidth, 0, Math.PI * 2);
		if (i % 10 >= 5) {
			ctx.fillStyle = "rgb(255, 0, 0)";
		} else {
			ctx.fillStyle = "rgb(0, 0, 255)";
		}
		ctx.fill();
	}
	ctx.fillStyle = "#000000";

	requestAnimationFrame(frame);
}

window.onload = function() {
	for (var i = 0; i < 5; i++) {
		bones.push({x: i * boneLength + 100, y: 100});
	}

	for (var i = 0; i < 100; i++) {
		foods.push({ x: 800 * Math.random(), y: 600 * Math.random()});
	}
	ctx.lineCap = "round";
	requestAnimationFrame(frame);
}

canvas.onmousemove = function(e) {
	target.x = e.offsetX;
	target.y = e.offsetY;
}