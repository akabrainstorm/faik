var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var seglen = document.getElementById('seglen');
var segcon = document.getElementById('segcon');
var origix = document.getElementById('origix');
var origiy = document.getElementById('origiy');

var segments = [];
var segLength = 100;
var segCount = 3;

var origin = { x: 0, y: 0 };

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
	segments = [{ x: origin.x, y: origin.y }];
	for (var i = 1; i < segCount + 1; i++) {
		segments.push({ x: origin.x + i * segLength, y: origin.y});
	}
}

var render = function() {
	ctx.clearRect(0, 0, 800, 600);
	ctx.fillText("Fixed Forward and Backward Reaching Inverse Kinematics by Elgun Huseyn (aka BrainStorm)", 400, 15);
	drawSegments();
}

window.onload = function() {
	ctx.textAlign = 'center';
	recreateSegments();
	render();
}

var backwardChain = function(x, y) {
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
}

var forwardChain = function(x, y) {
	segments[segments.length-1].x = x;
	segments[segments.length-1].y = y;

	for (var i = segments.length-2; i >= 0; i--) {
		var dx = segments[i].x - segments[i+1].x;
		var dy = segments[i].y - segments[i+1].y;
		var dl = Math.sqrt(dx*dx + dy*dy);

		dx = dx * segLength / dl;
		dy = dy * segLength / dl;

		segments[i].x = segments[i+1].x + dx;
		segments[i].y = segments[i+1].y + dy;
	}
}

canvas.onmousemove = function(e) {
	var x = e.offsetX - 400;
	var y = 300 - e.offsetY;

	backwardChain(x, y);
	forwardChain(origin.x, origin.y);

	render();
}

seglen.oninput = segcon.oninput = origix.oninput = origiy.oninput = function(e) {
	segLength = seglen.valueAsNumber;
	segCount = segcon.valueAsNumber;
	origin.x = origix.valueAsNumber;
	origin.y = origiy.valueAsNumber;
	recreateSegments();
	render();
}