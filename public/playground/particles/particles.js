var camera;
var cameraPOI;
var scene;
var renderer;
 
var clock;
var deltaTime;
 
var emitter;
var newSizesArray = [], oldSizesArray = [];
var timeSinceLastRand;

document.addEventListener("DOMContentLoaded", function(event) { 
	init();
});

function main(){//For particles. Called by init.

	/*grid = new ParticleArray({
		size: {
			x: 80,
			y: 1,
			z: 80
		},
		position: new THREE.Vector3(0,-30,0)
	});
	*/
	emitter = new ParticleEmitter();
	
	createPanel();
	
}

function animate() {
    deltaTime = clock.getDelta(); //Time
	time = Date.now();
	
	//camera.param.angle += .5 * deltaTime;
	
	//updateCamera();	
	//grid.updateParticles();
	emitter.updateParticles();
	
	render();
	
	requestAnimationFrame( animate );
}

function createPanel() {
	
	var panel = new dat.GUI( { width: 310 } );
	var folder1 = panel.addFolder( 'Emitter' );
	var folder2 = panel.addFolder( 'Emitter Particle' );
	var folder2 = panel.addFolder( 'Array' );
	var text = {
		'e.rate':				1000,
		'e.position.x':			0,
		'e.position.y':			0,
		'e.position.z':			0,
		'e.type':				"Random",
		'e.size.x':				0,
		'e.size.y':				0,
		'e.size.z':				0,
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
		'e.particle.color':				"#ffffff",
		'e.particle.colorRandom':		0,
	};
	//folder1.add( settings, 'show model' ).onChange( showModel );
	//folder1.add( settings, 'show skeleton' ).onChange( showSkeleton );
	folder1.add(text, 'e.rate').min(0).onChange(function(v){emitter.rate = v;emitter.initializeParticles();});;
	folder1.add(text, 'e.position.x',-100,100).onChange(function(v){emitter.position.x = v});
	folder1.add(text, 'e.position.y',-100,100).onChange(function(v){emitter.position.y = v});
	folder1.add(text, 'e.position.z',-100,100).onChange(function(v){emitter.position.z = v});
	folder1.add(text, 'e.type', ["Random", "Directional"]).onChange(function(v){emitter.type = v});
	folder1.add(text, 'e.size.x',0,200).onChange(function(v){emitter.size.x = v});
	folder1.add(text, 'e.size.y',0,200).onChange(function(v){emitter.size.y = v});
	folder1.add(text, 'e.size.z',0,200).onChange(function(v){emitter.size.z = v});
	folder1.add(text, 'e.physics.air',0,0.5).step(0.01).onChange(function(v){emitter.physics.air = v});
	folder1.add(text, 'e.physics.gravity',0,1).step(0.01).onChange(function(v){emitter.physics.gravity = v});
	folder1.add(text, 'e.particle.velocity',0,100).step(0.5).onChange(function(v){emitter.particle.velocity = v});
	folder1.add(text, 'e.particle.velocityDir.x',-100,100).onChange(function(v){emitter.particle.velocityDir.x = v});
	folder1.add(text, 'e.particle.velocityDir.y',-100,100).onChange(function(v){emitter.particle.velocityDir.y = v});
	folder1.add(text, 'e.particle.velocityDir.z',-100,100).onChange(function(v){emitter.particle.velocityDir.z = v});
	folder1.add(text, 'e.particle.velocityDirRandom',0,100).onChange(function(v){emitter.particle.velocityDirRandom = v});
	folder1.add(text, 'e.particle.duration',0,10).step(0.1).onChange(function(v){emitter.particle.duration = v;emitter.initializeParticles();});
	folder1.add(text, 'e.particle.startSize',0,20).step(0.1).onChange(function(v){emitter.particle.startSize = v});
	folder1.add(text, 'e.particle.endSize',0,20).step(0.1).onChange(function(v){emitter.particle.endSize = v});
	folder1.addColor(text, 'e.particle.color').onChange(function(v){emitter.particle.color = new THREE.Color(v)});
	folder1.add(text, 'e.particle.colorRandom',0,1).step(0.01).onChange(function(v){emitter.particle.colorRandom = v});
	
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





