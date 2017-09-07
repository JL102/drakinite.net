var camera;
var cameraPOI;
var scene;
var renderer;
var cubeMesh;
 
var clock;
var deltaTime;
 
var particleSystem, uniforms, geometry;
var maxParticles;
var emitter = {
		rate: 8000,
		pos: new THREE.Vector3( 0,0,0 ),
		size: {
			x: 0,
			y: 0,
			z: 0
		},
		particle: {
			velocity: {
				dir: new THREE.Vector3( 0, 0, 0 ),
				amount: 10,
				random: 100 
			}, //velocity not finished yet
			duration: 3
		},
		velocity: {},
		
		particleInfo: []
	};
    
	maxParticles = emitter.rate * emitter.particle.duration * 1.25;

document.addEventListener("DOMContentLoaded", function(event) { 
	init();

	createParticleSystem();

	animate();
});



 
function init() {
 
    clock = new THREE.Clock(true);
	
	deltaTime = clock.getDelta(); //for initiation of particles
     
    scene = new THREE.Scene();
	
	//CAMERA
    camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(0,0,50);
	
	camera.param = { 
		r: 60, //radius
		y: .2, //vertical angle
		angle: 0.1 //horizontal angle
	};
	
	//Point of interest for camera
    CameraPOI = new THREE.Vector3( 0,0,0 );
	
	updateCamera();
	
	//RENDERER
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0x7c949c, 1 );
    document.body.appendChild( renderer.domElement );
 
    window.addEventListener( 'resize', onWindowResize, false );
         
    render();
}

function animate() {
	
    deltaTime = clock.getDelta(); //Time
	time = Date.now() * 0.005;
	
	camera.param.angle += 1 * deltaTime;
	
	updateCamera();
	//emitter.pos = camera.position;
	updateParticles();

	render();
    requestAnimationFrame( animate );
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

function createParticleSystem() {

		 
    geometry = new THREE.BufferGeometry();
	var texture = new THREE.TextureLoader().load("images/snowflake.png");
	
	//CUSTOM SHADER SHIZ
	
	//Values that are constant for all particles during a draw call
	uniforms = {
		color:     	{ type: 'c', value: new THREE.Color( 0xffffff ) },
		texture:   	{ type: 't', value: texture },
	};
	
	//Material	
	var shaderMaterial = new THREE.ShaderMaterial({
		
		uniforms:	uniforms,
		vertexShader: document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
		transparent: true,
		//alphaTest: 0.5,
		depthTest: false,
		blending: THREE.AdditiveBlending
	});
	
	var positions = new Float32Array(maxParticles * 3);
	var colors = new Float32Array(maxParticles * 3);
	var sizes = new Float32Array(maxParticles);
	var alphas = new Float32Array(maxParticles);
	
	//var color = new THREE.Color();
	
 
    //Create particles
    for (var i = 0, i3 = 0; i < maxParticles; i++, i3 += 3) {
     
        // ZERO ALL THE THINGS
        positions[ i3 + 0 ] = 0;
        positions[ i3 + 1 ] = 0;
        positions[ i3 + 2 ] = 0;
               
        //color.setHSL( i / maxParticles, 1.0, 0.5);
		
		colors[ i3 + 0 ] = 0;
		colors[ i3 + 1 ] = 0;
		colors[ i3 + 2 ] = 0;
		
		alphas[ i ] = 0; //Math.random();
		
		sizes[ i ] = 0;
		
		emitter.particleInfo.push({
			index: i,
			index3: i3,
			visible: false,
			age: 0,
			velocity: {
				x: 0,
				y: 0,
				z: 0
			}
		});
		
    } 
	
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3) );
	geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3) );
	geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1) );
	geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1) );//not yet working
	
	//Creates particle system
	particleSystem = new THREE.Points( geometry, shaderMaterial );

	 
    scene.add(particleSystem);  
}


function updateParticles() {
	
	var alphas = geometry.attributes.alpha.array;
	var positions = geometry.attributes.position.array;
	var p = emitter.particleInfo;
	var numToDo = emitter.rate * deltaTime;
	
	for(var i = 0; i < emitter.particleInfo.length; i++){
				
		if( p[i].visible == true ){
			
			positions[p[i].index3 + 0] += p[i].velocity.x * deltaTime;
			positions[p[i].index3 + 1] += p[i].velocity.y * deltaTime;
			positions[p[i].index3 + 2] += p[i].velocity.z * deltaTime;
			
			p[i].age += deltaTime;
			
			if( p[i].age >= emitter.particle.duration ){
				
				p[i].visible = false;
				p[i].age = 0;
				alphas[i] = 0;
				
			}
		}else if( numToDo > 0 ){

			createNewParticle( p[i].index, p[i].index3 );
			
			p[i].visible = true;
			
			p[i].velocity.x = 100 * Math.random() - 50;
			p[i].velocity.y = 100 * Math.random() - 50;
			p[i].velocity.z = 100 * Math.random() - 50;
			
			numToDo--;
		}
	}
	
	var sizes = geometry.attributes.size.array;
	
	geometry.attributes.size.needsUpdate = true;
	geometry.attributes.alpha.needsUpdate = true;
	geometry.attributes.position.needsUpdate = true;
	geometry.attributes.customColor.needsUpdate = true;

}

function createNewParticle(i, i3/*Indices of particle*/){
	
	var positions = geometry.attributes.position.array;
	var colors = geometry.attributes.customColor.array;
	var alphas = geometry.attributes.alpha.array;
	var sizes = geometry.attributes.size.array;
	
	// Random position within bounds
	positions[ i3 + 0 ] = emitter.pos.x + Math.random() * emitter.size.x - emitter.size.x/2;
	positions[ i3 + 1 ] = emitter.pos.y + Math.random() * emitter.size.y - emitter.size.y/2;
	positions[ i3 + 2 ] = emitter.pos.z + Math.random() * emitter.size.z - emitter.size.z/2;
		   
	//color.setHSL( i / maxParticles, 1.0, 0.5);
	
	colors[ i3 + 0 ] = Math.pow(Math.random(),2); //color.r;
	colors[ i3 + 1 ] = Math.pow(Math.random(),2); //color.g;
	colors[ i3 + 2 ] = Math.pow(Math.random(),2); //color.b;
	
	alphas[ i ] = 1; //Math.random();
	
	sizes[ i ] = .5;
	
}


function updateCamera(){
	
	/* Creates positioning based on y being a value instead of angle
	var y = camera.param.y + CameraPOI.y;
	
	var horX = Math.sin( camera.param.angle ) * camera.param.r
	var horZ = Math.cos( camera.param.angle ) * camera.param.r
	*/
	
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
	
	/*
	var angX = camera.param.y * -1; //Euler x is vector y
	var angY = camera.param.angle; //Euler y is vector x and z
	var angZ = 0; //Z is yaw. Not worrying about that for now.
	*/
	
	var dx = x - CameraPOI.x;
	var dy = y - CameraPOI.y;
	var dz = z - CameraPOI.z;
	/*
	var rotx = Math.atan2( dy, dz )
	var roty = Math.atan2( dx * Math.cos(rotx), dz )
	var rotz = Math.atan2( Math.cos(rotx), Math.sin(rotx) * Math.sin(roty) )
	
	
	var rotx = Math.atan2( dy, dz );
	 if (dz >= 0) {
		var roty = -Math.atan2( dx * Math.cos(rotx), dz );
	 }else{
		var roty = Math.atan2( dx * Math.cos(rotx), -dz );
	 }
	
	var rotz = Math.atan2( Math.cos(rotx), Math.sin(rotx) * Math.sin(roty) );
	
	camera.rotation.set( rotx, -roty, rotz, 'XYZ' );// Not functional currently
	*/
	camera.lookAt( CameraPOI );
}






