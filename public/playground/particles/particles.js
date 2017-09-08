var camera;
var cameraPOI;
var scene;
var renderer;
var cubeMesh;
 
var clock;
var deltaTime;
 
var particleSystem, uniforms, geometry;
var maxParticles;

var numFramesToDo = 1000;

var emitter = {
		rate: 1000,
		pos: new THREE.Vector3( 0.1,0,0 ),
		size: {
			x: 0,
			y: 0,
			z: 0
		},
		particle: {
			velocity: {
				dir: new THREE.Vector3( 0, 0, 0 ),
				amount: 40,
				dirRandom: 1,
				amountRandom: 0
			}, //velocity not finished yet
			duration: 2,
			startSize: 3,
			endSize: 0,
			color: new THREE.Color(0xb53c3c),
			colorRandom: .2
		},
		physics: {
			air: .3,
			gravity: {
				amt: 0 //object to allow for direction later
			}
		},
		velocity: {},
		
		particleInfo: []
	};
    
	maxParticles = emitter.rate * emitter.particle.duration + emitter.rate + 1;

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
		y: 0, //vertical angle
		angle: 0.1 //horizontal angle
	};
	
	//Point of interest for camera
    CameraPOI = new THREE.Vector3( 0,0,0 );
	
	updateCamera();
	
	//RENDERER
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0x000000, 1 );
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
	
	//emitter.particle.velocity.dir.z += 3 * deltaTime;
	
	render();
	//if(numFramesToDo > 0){
		numFramesToDo--;
		requestAnimationFrame( animate );
	//}
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
	
	var positions = geometry.attributes.position.array;
	var colors = geometry.attributes.customColor.array;
	var alphas = geometry.attributes.alpha.array;
	var sizes = geometry.attributes.size.array;
	
	var p = emitter.particleInfo;
	var numToDo = emitter.rate * deltaTime;
	
	for(var i = 0; i < emitter.particleInfo.length; i++){
				
		if( p[i].visible == true ){
			
			//Animate particles
			
			//Velocity
			positions[p[i].index3 + 0] += p[i].velocity.x /60;// * deltaTime;
			positions[p[i].index3 + 1] += p[i].velocity.y /60;//* deltaTime;
			positions[p[i].index3 + 2] += p[i].velocity.z /60;//* deltaTime;
			
			//Air resistance
			p[i].velocity.x *= 1 - ( emitter.physics.air / 10 );
			p[i].velocity.y *= 1 - ( emitter.physics.air / 10 );
			p[i].velocity.z *= 1 - ( emitter.physics.air / 10 );
			
			//Gravity
			p[i].velocity.y -= emitter.physics.gravity.amt;// * deltaTime * 60;
			
			//Lerp size
			sizes[i] = lerp( emitter.particle.startSize, emitter.particle.endSize,
								p[i].age / emitter.particle.duration);
			
			//Increase age
			p[i].age += deltaTime;
			
			if( p[i].age >= emitter.particle.duration ){
				
				//Delete particle
				p[i].visible = false;
				p[i].age = 0;
				alphas[i] = 0;
			}
		}else if( numToDo > 0 && p[i].visible != true ){
			
			//If you still have more particles to create
			createNewParticle( p[i], p[i].index, p[i].index3 );
						
			numToDo--;
		}
	}
	
	geometry.attributes.size.needsUpdate = true;
	geometry.attributes.alpha.needsUpdate = true;
	geometry.attributes.position.needsUpdate = true;
	geometry.attributes.customColor.needsUpdate = true;
}

function createNewParticle(p/*Particle in info array*/, i, i3/*Indices of particle*/){
	
	var positions = geometry.attributes.position.array;
	var colors = geometry.attributes.customColor.array;
	var alphas = geometry.attributes.alpha.array;
	var sizes = geometry.attributes.size.array;
	
	p.visible = true;
	
	var angX = emitter.particle.velocity.dir.x,
		angY = emitter.particle.velocity.dir.y,
		angZ = emitter.particle.velocity.dir.z,
		angAmt = emitter.particle.velocity.amount,
		angRand = emitter.particle.velocity.dirRandom;
	
	angX = lerp(angX, ( Math.random() - .5 ) * 2 * Math.PI, angRand);
	angY = lerp(angY, ( Math.random() - .5 ) * 2 * Math.PI, angRand);
	angZ = lerp(angZ, ( Math.random() - .5 ) * 2 * Math.PI, angRand);
	
	p.velocity.x = ( Math.cos(angZ) * Math.cos(angY) ) * angAmt;
	p.velocity.y = ( Math.sin(angZ) * Math.sin(angX) ) * angAmt;
	p.velocity.z = ( Math.cos(angX) * Math.sin(angY) )* angAmt;//Math.cos(angX) * angAmt;
	
	// Random position within bounds
	positions[ i3 + 0 ] = emitter.pos.x + Math.random() * emitter.size.x - emitter.size.x/2;
	positions[ i3 + 1 ] = emitter.pos.y + Math.random() * emitter.size.y - emitter.size.y/2;
	positions[ i3 + 2 ] = emitter.pos.z + Math.random() * emitter.size.z - emitter.size.z/2;
		   
	//color.setHSL( i / maxParticles, 1.0, 0.5);
	
	colors[ i3 + 0 ] = lerp( emitter.particle.color.r, Math.pow(Math.random(),2), 
		emitter.particle.colorRandom ); //color.r;
	colors[ i3 + 1 ] = lerp( emitter.particle.color.g, Math.pow(Math.random(),2), 
		emitter.particle.colorRandom ); //color.g;
	colors[ i3 + 2 ] = lerp( emitter.particle.color.b, Math.pow(Math.random(),2), 
		emitter.particle.colorRandom ); //color.b;
	
	alphas[ i ] = 1; //Math.random();
	
	sizes[ i ] = emitter.particle.size;
	
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

function lerp(v0, v1, t) {
    return v0*(1-t)+v1*t
}




