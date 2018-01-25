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
	
	emitter1 = new Emitter({});
	emitter2 = new Emitter({
		position: new THREE.Vector3(0,-15,0),
		size: new THREE.Vector3(20,0,20),
		velocity: 2
	});
	particle1 = new Particle({
		colorStart: new THREE.Color("gray"),
		colorEnd: new THREE.Color("black"),
		startSize: 3,
		endSize: 1
	});
	particle2 = new Particle({
		colorEnd: new THREE.Color("green"),
		startSize: 1,
		endSize: 0,
		duration: 1.5
	});
	
	emitter1.addParticle(particle1);
	emitter1.addParticle(particle2);
	
	emitter2.addParticle(particle1);
	
	emitter2.initialize();
	emitter1.initialize();
	
	camera.param.r = 40;
	
	//createPanel();
}

function customAnimateScript(){
		
	camera.param.angle += deltaTime;
	
}

function animate() {
    deltaTime = clock.getDelta(); //Time
	time = Date.now();
	
	emitter1.updateParticles(deltaTime);	
	emitter2.updateParticles(deltaTime);
	
	customAnimateScript();

	updateCamera();
	
	render();
	
	requestAnimationFrame( animate );
}

function init() {
 
	//SCENE/CAMERA INITIATION
    clock = new THREE.Clock(true);
	deltaTime = clock.getDelta(); //for initiation of particles
    scene = new THREE.Scene();
	
	//CAMERA
	orbitcontrols = false;
	if(orbitcontrols == true){
		controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls.target.set( 0, 0, 0 );
		controls.update();
		
	}else{
		camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 1000);
		camera.position.set(0,0,50);
		
		camera.param = { 
			r: 60, //radius
			y: 0, //vertical angle
			angle: 0 //horizontal angle
		};
		
		//Point of interest for camera
		CameraPOI = new THREE.Vector3( 0,0,0 );
		
		updateCamera();
	}
	
	//RENDERER
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0x000000, 1 );
    document.body.appendChild( renderer.domElement );
 
    window.addEventListener( 'resize', onWindowResize, false );
	
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