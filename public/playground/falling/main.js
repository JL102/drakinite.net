document.addEventListener("DOMContentLoaded", function(event) { 
	init();
});
var canvas, ctx;
var paths = [];
var untrackedPath;
var timeUntilNextPath;
var pathDeathTime = 120;
/*
var path = {
	pts = [0,1,2,3,4,5,6],
	ptsOrig = [0,1,2,3,4,5,6], //originally pts, stays same, used for lerp
	color = "color",
	startColor = "startcolor"
	endColor = "endcolor"
	age = 0;//"age in frames"
}//ref
*/
function init(){
	canvas = document.getElementById("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	ctx = canvas.getContext('2d');
	
		
	timeUntilNextPath = 0;
	animate();
}

function animate(){
	
	timeUntilNextPath--;
	
	if(timeUntilNextPath <= 0){
		timeUntilNextPath = 15 + Math.random()*50;
		createNewPath();
	}
	
	if(paths[0] != undefined){
		fillBg(untrackedPath.color);
		for(var i = paths.length-1; i >= 0; i--){
			updatePath(i);
			fillPath(i);
		}
	}
	
	requestAnimationFrame(animate);
}

function createNewPath(){
	var age = 0;
	var startColor = randomColor();
	var endColor = randomColor();
	var pts = [0,0,50,0,100,0,canvas.width,0];
	var ptsOrig = pts.slice(0);
	
	var path = {
		pts: pts,
		ptsOrig: ptsOrig,
		color: startColor,
		startColor: startColor,
		endColor: endColor,
		age: age
	};
	
	untrackedPath = path;
	
	setTimeout(function(){
		paths.push(untrackedPath);
	}, timeUntilNextPath);//adds to updatepath thingymajiggy after a certain amt of time
}

function fillPath(i){
	var path = paths[i];
	
	ctx.beginPath();
	ctx.lineWidth = "0";
	
	ctx.fillStyle = path.color;
	
	ctx.moveTo(0, canvas.height);//beginning
	for(var i = 0; i < path.pts.length; i += 2){
		ctx.lineTo(path.pts[i], path.pts[i + 1]);
		
	}
	ctx.lineTo(canvas.width, canvas.height);//end
	ctx.fill();
}

function updatePath(i){
	var path = paths[i];
	
	path.color = lerpColor(path.startColor, path.endColor, path.age/pathDeathTime);
	
	for(var i = 0; i < path.pts.length; i += 2){
		path.pts[i] = lerp(path.ptsOrig[i], canvas.width/2, path.age/pathDeathTime);
		path.pts[i+1] = lerp(path.ptsOrig[i+1], canvas.height, path.age/pathDeathTime);
	}
	path.age++;
	
}

function randomColor(){
	return('#'+(Math.random()*0xFFFFFF<<0).toString(16));
}

function fillBg(color){
	ctx.fillStyle = color;
	ctx.fillRect(0,0,canvas.width, canvas.height);
}

function lerp(v0, v1, t) {
    return v0*(1-t)+v1*t
}
function lerpColor(a, b, amount) { 

    var ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}