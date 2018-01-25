var camera;
var cameraPOI;
var scene;
var renderer;
 
var clock;
var deltaTime;
 
var emitters;
var texts = [], text;
var ae = 0; //ae = active emitter
var newSizesArray = [], oldSizesArray = [];
var timeSinceLastRand;

var customAnimateScript;

document.addEventListener("DOMContentLoaded", function(event) { 
	init();
});

function main(){//For particles. Called by init.
	
	emitters = new Array(4);
	
	for(var i = 0; i < emitters.length; i++){
		emitters[i] = new ParticleEmitter();
		emitters[i].enabled = false;
	}
	emitters[0].enabled = true;
	
	
	
	createPanel();
	
}

function animate() {
    deltaTime = clock.getDelta(); //Time
	time = Date.now();
	
	runCustomAnimateScript();
	
	for(var i = 0; i < emitters.length; i++){
		emitters[i].updateParticles(deltaTime);
	}
	
	render();
	
	requestAnimationFrame( animate );
}

function runCustomAnimateScript(){
	//Filled from text input after updateCustomAnimateScript is called
	//Called from within animate (which is run every frame)
}

function updateCustomAnimateScript(){
	//Parse document.querySelectorAll("textarea[name='customAnimateScript']").value 
	//into a script, and enter it into runCustomAnimateScript
	var customAnimateScript = document.querySelectorAll("textarea[name='customAnimateScript']")[0].value;
		runCustomAnimateScript = function(){
		eval( customAnimateScript );
	}
	animate;
}

function addRemoveEmitters(v, i){
	if(v == true){
		emitters[i].enabled = true;
		scene.add(emitters[i].particleSystem);
	}else{
		emitters[i].enabled = false;
		scene.remove(emitters[i].particleSystem);
	}
}

function switchEmitters(e){
	//backs up setting for current emitter
	texts[ae] = text;
	
	//sets settings for new emitter
	ae = e;
	text = texts[ae];
}

function createPanel() {
	
	var panel = new dat.GUI( { width: 310 } );
	var folder0 = panel.addFolder( 'Scene' );
	var folder1 = panel.addFolder( 'Emitter' );
	var folder2 = panel.addFolder( 'Particle' );
	text = {
		'Background color':		"#000000",
		'Emitter 1':			true,
		'Emitter 2':			false,
		'Emitter 3':			false,
		'Emitter 4':			false,
		'EMITTER:':				"1",
		'e.rate':				1000,
		'e.position.x':			0,
		'e.position.y':			0,
		'e.position.z':			0,
		'e.size.x':				0,
		'e.size.y':				0,
		'e.size.z':				0,
		'e.type':				"Random",
		'e.physics.air':		0,
		'e.physics.gravity':	0,
		'e.particle.velocity':	10,
		'e.particle.velocityRandom': 	0,
		'e.particle.velocityDir.x': 	0,
		'e.particle.velocityDir.y': 	20,
		'e.particle.velocityDir.z': 	0,
		'e.particle.velocityDirRandom': 15,
		'e.particle.duration':			2,
		'e.particle.startSize':			1,
		'e.particle.endSize':			1,
		'e.particle.colorStart':		"#ffffff",
		'e.particle.colorEnd':			"#ffffff",
		'e.particle.colorRandom':		0,
		'e.particle.alphaStart':				1,
		'e.particle.alphaEnd':				1,
	};
	for(var i = 0; i < texts.length; i++){
		texts[i] = text; //initializes text backup
	}
	folder0.addColor(text, 'Background color').onChange(function(v){ renderer.setClearColor( v, 1 ) });
	folder0.add(text, "Emitter 1").onChange(function(v){ addRemoveEmitters(v, 0) });
	folder0.add(text, "Emitter 2").onChange(function(v){ addRemoveEmitters(v, 1) });
	folder0.add(text, "Emitter 3").onChange(function(v){ addRemoveEmitters(v, 2) });
	folder0.add(text, "Emitter 4").onChange(function(v){ addRemoveEmitters(v, 3) });
	folder1.add(text, 'EMITTER:', [1, 2, 3, 4]).onChange( function(v){ switchEmitters(v - 1) });//v - 1 for user friendliness (starting at 1 instead of 0)
	folder1.add(text, 'e.rate').min(0).onChange(function(v){emitters[ae].rate = v;emitters[ae].initializeParticles();});;
	folder1.add(text, 'e.position.x',-100,100).onChange( function(v){ emitters[ae].position.x = v } );
	folder1.add(text, 'e.position.y',-100,100).onChange(function(v){emitters[ae].position.y = v});
	folder1.add(text, 'e.position.z',-100,100).onChange(function(v){emitters[ae].position.z = v});
	folder1.add(text, 'e.type', ["Random", "Directional"]).onChange(function(v){emitters[ae].type = v});
	folder1.add(text, 'e.size.x',0,400).onChange(function(v){emitters[ae].size.x = v});
	folder1.add(text, 'e.size.y',0,400).onChange(function(v){emitters[ae].size.y = v});
	folder1.add(text, 'e.size.z',0,400).onChange(function(v){emitters[ae].size.z = v});
	folder1.add(text, 'e.physics.air',0,3).step(0.01).onChange(function(v){emitters[ae].physics.air = v});
	folder1.add(text, 'e.physics.gravity',-20,20).step(0.1).onChange(function(v){emitters[ae].physics.gravity = v});
	folder2.add(text, 'e.particle.velocity',0,100).step(0.5).onChange(function(v){emitters[ae].particle.velocity = v});
	folder2.add(text, 'e.particle.velocityRandom',0,1).step(0.01).onChange(function(v){emitters[ae].particle.velocityRandom = v});
	folder2.add(text, 'e.particle.velocityDir.x',-100,100).onChange(function(v){emitters[ae].particle.velocityDir.x = v});
	folder2.add(text, 'e.particle.velocityDir.y',-100,100).onChange(function(v){emitters[ae].particle.velocityDir.y = v});
	folder2.add(text, 'e.particle.velocityDir.z',-100,100).onChange(function(v){emitters[ae].particle.velocityDir.z = v});
	folder2.add(text, 'e.particle.velocityDirRandom',0,100).onChange(function(v){emitters[ae].particle.velocityDirRandom = v});
	folder2.add(text, 'e.particle.duration',0,10).step(0.1).onChange(function(v){emitters[ae].particle.duration = v;emitters[ae].initializeParticles();});
	folder2.add(text, 'e.particle.startSize',0,20).step(0.1).onChange(function(v){emitters[ae].particle.startSize = v});
	folder2.add(text, 'e.particle.endSize',0,20).step(0.1).onChange(function(v){emitters[ae].particle.endSize = v});
	folder2.addColor(text, 'e.particle.colorStart').listen().onChange(function(v){emitters[ae].particle.colorStart = new THREE.Color(v)});
	folder2.addColor(text, 'e.particle.colorEnd').onChange(function(v){emitters[ae].particle.colorEnd = new THREE.Color(v)});
	folder2.add(text, 'e.particle.colorRandom',0,1).step(0.01).onChange(function(v){emitters[ae].particle.colorRandom = v});
	folder2.add(text, 'e.particle.alphaStart',0,1).step(0.01).onChange(function(v){emitters[ae].particle.alphaStart = v});
	folder2.add(text, 'e.particle.alphaEnd',0,1).step(0.01).onChange(function(v){emitters[ae].particle.alphaEnd = v});
	
	folder1.open();
	folder2.open();
	
	panel.remember(text);
}

function randomSizes(){
	
	var pinfo = array.particleInfo;
	
	oldSizesArray = newSizesArray;
	newSizesArray = [];
	
	noise.seed(Math.random());
		
	for(var i = 0; i < pinfo.length; i++){
		
		var p = pinfo[i];
			
		var scale = 10;
		
		var value = noise.simplex3(p.position.x / scale, p.position.y / scale, p.position.z / scale);
		
		value = (array.particle.minSize + value) * (array.particle.maxSize / 2);
		
		newSizesArray[i] = value;
		
	}
	
	timeSinceLastRand = Date.now();
	
}

function lerpSizes(){
	
	var pinfo = array.particleInfo;
	
	for(var i = 0; i < pinfo.length; i++){
		
		
		pinfo[i].size = lerp( oldSizesArray[i], newSizesArray[i], (time - timeSinceLastRand)/1000);
		
	}
}

function init() {
 
	//SCENE/CAMERA INITIATION
    clock = new THREE.Clock(true);
	deltaTime = clock.getDelta(); //for initiation of particles
    scene = new THREE.Scene();
	
	//CAMERA
    camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(0,0,50);
	/*
	camera.param = { 
		r: 60, //radius
		y: 0, //vertical angle
		angle: 0 //horizontal angle
	};
	
	//Point of interest for camera
    CameraPOI = new THREE.Vector3( 0,0,0 );
	
	updateCamera();
	*/
	//RENDERER
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0x000000, 1 );
    document.body.appendChild( renderer.domElement );
 
    window.addEventListener( 'resize', onWindowResize, false );
	
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 0, 0 );
	controls.update();
	
	//MAIN PROGRAM
	main();
	
	render();//render first frame?
	
	//Animate has render inside
	animate();
}
 
function render() {
    renderer.render( scene, camera );
}
 
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
}


function updateCamera(){
	
	//if camera.param.y >= pi/2 or <= -pi/2, make it equal (bounds to half a pi)
	if( camera.param.y >= 1.5707){
		camera.param.y = 1.5707;
		
	}else if( camera.param.y <= -1.5707 ){
		camera.param.y = -1.5707
	}
	//Set values of y and a horizontal radius for x+z
	var y = Math.sin( camera.param.y ) * camera.param.r;
	var xx = Math.cos( camera.param.y ) * camera.param.r;
	//Set values of x and z with xx as a radius
	var x = Math.sin( camera.param.angle ) * xx
	var z = Math.cos( camera.param.angle ) * xx
	
	camera.position.set( x, y, z );
	
	
	var dx = x - CameraPOI.x;
	var dy = y - CameraPOI.y;
	var dz = z - CameraPOI.z;

	camera.lookAt( CameraPOI );
}





