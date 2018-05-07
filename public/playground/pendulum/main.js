$(init);

var canvas, ctx, docWidth, docHeight;
var pendulum = {
	mass: 0.2,
	length: 300,
	E: 0,
	U: 0,
	K: 0,
	ang: 1.4,
	v: 0
};
var phys = {
	g: 9.8,
	energyLoss: 0.01
}
var startX, startY, halfWidth;
var lastDraw;

var pendulumStyle = {
	strokeStyle: "#000000",
	lineWidth: 1.5,
	massFillStyle: "#003060",
	massRadius: 10,
	length: pendulum.length
}

function init(){
	var canvas = document.createElement("canvas");
	canvas.id = "canvas";
	doResize(canvas);
	document.body.appendChild(canvas);
	
	ctx = canvas.getContext("2d");
	
	halfWidth = docWidth/2;
	startX = halfWidth;
	startY = 200;
	
	let ang = pendulum.ang;
	let len = pendulum.length;
	let h = len * (1 - Math.cos(ang));
	pendulum.E = pendulum.mass * phys.g * h;
	pendulum.U = pendulum.E;
	
	lastDraw = Date.now();
	animate();
}

function animate(){
	flashScreen();
	drawPendulum();
	
	let m = pendulum.mass;
	let g = phys.g;
	//let v = pendulum.v;
	let r = pendulum.length / 30;
	let ang = pendulum.ang % ( 2 * Math.PI );
	let t = (Date.now() - lastDraw) / 1;
	
	let h = r * (1 - Math.cos(ang));
	
	let v = pendulum.v;
	let w = v / r;
	
	let a = g - g * Math.cos( ang );
	let alph = a / r;
	let dw = alph * t;
	w = w + dw; 
	
	let dAng = w * t;
	pendulum.ang += dAng;
	
	$("#info").html("a: " + a + "<br/>v: "+ v + "<br/>ang: " + ang);
	
	lastDraw = Date.now();
	requestAnimationFrame(animate);
}

function flashScreen(){
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, docWidth, docHeight);
}

function drawPendulum(){
	ctx.strokeStyle = pendulumStyle.strokeStyle;
	ctx.lineWidth = pendulumStyle.lineWidth;
	ctx.fillStyle = pendulumStyle.massFillStyle;
	
	ctx.beginPath();
	ctx.moveTo(startX, startY);
	
	let len = pendulumStyle.length;
	let destX = startX + len * Math.sin( pendulum.ang );
	let destY = startY + len * Math.cos( pendulum.ang );
	
	ctx.lineTo( destX, destY );
	ctx.stroke();
	
	ctx.beginPath();
	ctx.arc( destX, destY, pendulumStyle.massRadius, 0, 2*Math.PI, false );
	
	ctx.fill();
}

function doResize(elem){
	docWidth = $(window).innerWidth();
	docHeight = $(window).innerHeight();
	elem.width = docWidth;
	elem.height = docHeight;
}

var didResizeRecently = false;
$(window).resize(function(){
	if(!didResizeRecently){
		doResize(document.getElementById("canvas"));
		didResizeRecently = true;
		setTimeout(function(){
			didResizeRecently = false;
		}, 200);
	}
});