var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var seglen = document.getElementById('seglen');
var segcon = document.getElementById('segcon');

var segments = [];
var segLength = 100;
var segCount = 3;

var drawSegments = function() {
	ctx.transform(1, 0, 0, -1, 400, 300);

	ctx.beginPath();
	ctx.moveTo(segments[0].x, segments[0].y);

	for (var i = 1; i < segments.length; i++)
		ctx.lineTo(segments[i].x, segments[i].y);

	ctx.stroke();
	ctx.resetTransform();
}

var recreateSegments = function() {
	segments = [{ x: 0, y: 0 }];
	for (var i = 1; i < segCount + 1; i++) {
		segments.push({ x: i * segLength, y: 0});
	}
}

var render = function() {
	ctx.clearRect(0, 0, 800, 600);
	ctx.fillText("Forward and Backward Reaching Inverse Kinematics by Elgun Huseyn (aka BrainStorm)", 400, 15);
	drawSegments();
}

window.onload = function() {
	ctx.textAlign = 'center';
	recreateSegments();
	render();
}

canvas.onmousemove = function(e) {
	var x = e.offsetX - 400;
	var y = 300 - e.offsetY;

	segments[0].x = x;
	segments[0].y = y;

	for (var i = 1; i < segments.length; i++) {
		var dx = segments[i].x - segments[i-1].x;
		var dy = segments[i].y - segments[i-1].y;
		var dl = Math.sqrt(dx*dx + dy*dy);

		dx = dx * segLength / dl;
		dy = dy * segLength / dl;

		segments[i].x = segments[i-1].x + dx;
		segments[i].y = segments[i-1].y + dy;
	}

	render();
}

seglen.oninput = segcon.oninput = function(e) {
	segLength = seglen.valueAsNumber;
	segCount = segcon.valueAsNumber;
	recreateSegments();
	render();
}