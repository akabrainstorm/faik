var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var seglen = document.getElementById('seglen');

var segments = [ { angle: 0, length: 100 }, { angle: 0, length: 100 } ];
var pointList = [];
var angleList = [];

var showInfo = true;

var selectedSeg = null;

var drawSegments = function() {
	ctx.transform(1, 0, 0, -1, 400, 300);

	var lastPosition = { x: 0, y: 0 };
	var totalAngle = 0;

	pointList = [{ x: 0, y: 0 }];
	angleList = [0];
	
	for (var i = 0; i < segments.length; i++) {
		ctx.beginPath();
		ctx.moveTo(lastPosition.x, lastPosition.y);

		var x = Math.cos(segments[i].angle + totalAngle) * segments[i].length;
		var y = Math.sin(segments[i].angle + totalAngle) * segments[i].length;

		ctx.lineTo(lastPosition.x + x, lastPosition.y + y);
		ctx.stroke();

		if (segments[i].angle != 0) {
			ctx.beginPath();
			ctx.setLineDash([5, 5]);
			ctx.moveTo(lastPosition.x, lastPosition.y);

			var lx = Math.cos(totalAngle) * 50;
			var ly = Math.sin(totalAngle) * 50;

			ctx.lineTo(lastPosition.x + lx, lastPosition.y + ly);
			ctx.stroke();
			ctx.setLineDash([]);

			var tx = Math.cos(totalAngle + segments[i].angle/2) * 30;
			var ty = Math.sin(totalAngle + segments[i].angle/2) * 30;
			ctx.fillStyle = 'black';
			ctx.resetTransform();
			ctx.fillText(Math.floor(segments[i].angle * 180 / Math.PI), 400+tx+lastPosition.x, 300-ty-lastPosition.y);
			ctx.transform(1, 0, 0, -1, 400, 300);
		}

		ctx.beginPath();
		ctx.arc(lastPosition.x, lastPosition.y, 10, 0, Math.PI*2);
		ctx.fillStyle = 'orange';
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(lastPosition.x, lastPosition.y, 20, totalAngle, totalAngle + segments[i].angle);
		ctx.stroke();

		lastPosition.x += x;
		lastPosition.y += y;
		totalAngle += segments[i].angle;

		pointList.push({ x: lastPosition.x, y: lastPosition.y });
		angleList.push(totalAngle);
	}

	ctx.translate(lastPosition.x, lastPosition.y);
	ctx.rotate(totalAngle);
	ctx.beginPath();
	ctx.moveTo(-10, 0);
	ctx.lineTo(0, -10);
	ctx.lineTo(10, 0);
	ctx.lineTo(0, 10);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();

	ctx.resetTransform();
	ctx.fillStyle = "black";
}

var drawArrow = function(fromX, fromY, toX, toY) {
	var angle = Math.atan2(toY - fromY, toX - fromX);
	ctx.beginPath();
	ctx.moveTo(fromX, fromY);
	ctx.lineTo(toX, toY);
	ctx.lineTo(toX - 10 * Math.cos(angle - Math.PI/6), toY - 10 * Math.sin(angle - Math.PI/6))
	ctx.moveTo(toX, toY);
    ctx.lineTo(toX - 10 * Math.cos(angle + Math.PI/6), toY - 10 * Math.sin(angle + Math.PI/6));
	ctx.stroke();
}

var draw = function() {
	ctx.clearRect(0, 0, 800, 600);
	ctx.fillStyle = 'black';
	ctx.fillText("Forward Kinematics by Elgun Huseyn (aka BrainStorm)", 400, 15);

	if (showInfo) {
		ctx.fillText("Drag and Rotate", 500, 280);
	}

	drawSegments();
}

window.onload = function() {
	ctx.textAlign = 'center';
	draw();
}

canvas.onmousedown = function(e) {
	var x = e.offsetX - 400;
	var y = 300 - e.offsetY;
	
	for (var i = 1; i < pointList.length; i++) {
		var dx = pointList[i].x - x;
		var dy = pointList[i].y - y;
		if (dx * dx + dy * dy < 400) {
			selectedSeg = i - 1;
			showInfo = false;
			return;
		}
	}
}

canvas.onmousemove = function(e) {
	if(selectedSeg == null) return;
	var x = e.offsetX - 400;
	var y = 300 - e.offsetY;

	var angle = Math.atan2(y - pointList[selectedSeg].y, x - pointList[selectedSeg].x);
	segments[selectedSeg].angle = angle - angleList[selectedSeg];
	draw();
}

canvas.onmouseup = function(e) {
	selectedSeg = null;
}

var addNew = function() {
	segments.push({ angle: 0, length: Math.max(seglen.valueAsNumber, 50) });;
	draw();
}