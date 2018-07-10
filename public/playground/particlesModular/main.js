var particleArrays = [];
var debug = {};
class ParticleArray{
	constructor(param){
		param = param ? param : {};
		param.size = param.size ? param.size : {};
		param.spacing = param.spacing ? param.spacing : {};
		param.position = param.position ? param.position : {};
		param.physics = param.physics ? param.physics : {};
		
		this.size = {
			x: param.size.x ? param.size.x : 50,
			y: param.size.y ? param.size.y : 50,
			z: param.size.z ? param.size.z : 1
		},
		this.spacing = {
			x: param.spacing.x ? param.spacing.x : 2,
			y: param.spacing.y ? param.spacing.y : 2,
			z: param.spacing.z ? param.spacing.z : 1
		},
		this.position = {
			x: param.position.x ? param.position.x : 0,
			y: param.position.y ? param.position.y : 0,
			z: param.position.z ? param.position.z : 0
		}
		this.physics = {
			attraction: param.physics.attraction ? {
				strength: param.physics.attraction.strength ? param.physics.attraction.strength : 0,
				minRadius: param.physics.attraction.minRadius ? param.physics.attraction.minRadius : 20,
				falloff: param.physics.attraction.falloff ? param.physics.attraction.falloff : 60
			} : {
				strength: 0.005,
				minRadius: 20,
				falloff: 30
			},
			repulsion: param.physics.repulsion ? {
				strength: param.physics.repulsion.strength ? param.physics.repulsion.strength : 0,
				minRadius: param.physics.repulsion.minRadius ? param.physics.repulsion.minRadius : 15,
				falloff: param.physics.repulsion.falloff ? param.physics.repulsion.falloff : 30
			} : {
				strength: 0.1,
				minRadius: 15,
				falloff: 30
			}
		}
		
		
		var particleArray = this.createParticleArray();
		particleArray.update = this.update;
		
		particleArray.size = this.size;
		particleArray.spacing = this.spacing;
		particleArray.physics = this.physics;
		
		particleArrays[particleArrays.length] = particleArray;
		return particleArray;
	}
	//Method for main constructor.
	createParticleArray(){
		var maxParticles = ( this.size.x / this.spacing.x ) * 
			( this.size.y / this.spacing.y ) * ( this.size.z / this.spacing.z );
		
		var geometry = new THREE.BufferGeometry();
		var texture = new THREE.TextureLoader().load("images/particle-0.png");
		
		//CUSTOM SHADER SHIZ
		
		//Values that are constant for all particles during a draw call
		var uniforms = {
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
		var opacities = new Float32Array(maxParticles);
		
		var color = new THREE.Color();
		
		//Create particles
		var size = this.size;
		var spacing = this.spacing;
		var pNum = {
			x: size.x / spacing.x,
			y: size.y / spacing.y,
			z: size.z / spacing.z
		}
		for(var xI = 0; xI < pNum.x; xI++){
			var x = xI * spacing.x;
			
			for(var yI = 0; yI < pNum.y; yI++){
				var y = yI * spacing.y;
				
				for(var zI = 0; zI < pNum.z; zI++){
					var z = zI * spacing.z;
					
					//calculates position index
					var i3 = 3 * ( ( xI * pNum.y * pNum.z ) + ( yI * pNum.z ) + zI );
					
					positions[ i3 + 0 ] = x;
					positions[ i3 + 1 ] = y;
					positions[ i3 + 2 ] = z;
				}
			}
		}
		for (var i = 0, i3 = 0; i < maxParticles; i++, i3 += 3) {
			
			color.setHSL( i / maxParticles, 1.0, 0.5);
			
			colors[ i3 + 0 ] = color.r;
			colors[ i3 + 1 ] = color.g;
			colors[ i3 + 2 ] = color.b;
			
			opacities[ i ] = Math.random();
			
			sizes[ i ] = 3;
								
		} 
		
		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3) );
		geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3) );
		geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1) );
		geometry.addAttribute( 'opacity', new THREE.BufferAttribute( opacities, 1) );//not yet working
		
		//Creates particle system
		var particleArray = new THREE.Points( geometry, shaderMaterial );
		particleArray.maxParticles = maxParticles;
		
		return particleArray;
	}
	//Method for particleArray (THREE.Points)
	update(){
		/*
		var sizes = this.geometry.attributes.size.array;
		
		for ( var i = 0; i < this.maxParticles; i++ ) {
			sizes[ i ] = 10 * ( 1 + Math.sin( 0.1 * i + time ) );
		}
		
		this.geometry.attributes.size.needsUpdate = true;
		*/
		let positions = this.geometry.attributes.position.array;
		let attraction = this.physics.attraction;
		
		for(var i = 0, i3 = 0; i < this.maxParticles; i++, i3 += 3){
			let x = positions[i3 + 0],
				y = positions[i3 + 1], 
				z = positions[i3 + 2];
			
			var pullX = 0, pullY = 0, pullZ = 0;
			
			for(var j = 0, j3 = 0; j < this.maxParticles; j++, j3 += 3){
				let dx = positions[j3 + 0] - x,
					dy = positions[j3 + 1] - y,
					dz = positions[j3 + 2] - z;
				let dxy = Math.sqrt( dx * dx + dy * dy );
				let angxy = Math.atan2( x, y );
				let dxyz = Math.sqrt( dxy * dxy + dz * dz );
				let angxyz = Math.atan2( dxy, z );
				
				if( dxyz < attraction.falloff ){
					if( dxyz > attraction.minRadius ){
						let percentPullStrength = 1 - (dxyz / attraction.falloff);
						let strength = percentPullStrength * attraction.strength;
						
						let strZ = Math.sin(angxyz) * strength;
						let strXY = Math.cos(angxyz) * strength;
						let strY = Math.sin(angxy) * strXY;
						let strX = Math.cos(angxy) * strXY;
						
						if(dx > 0){
							pullX += strX;
						}
						else{
							pullX -= strX;
						}
						if(dy > 0){
							pullY += strY;	
						}
						else{
							pullY -= strY;
						}
						if(dz > 0){
							pullZ += strZ;
						}
						else{
							pullX -= strZ;
						}
					}
				}
			}
			positions[i3 + 0] += pullX;
			positions[i3 + 1] += pullY;
			positions[i3 + 2] += pullZ;
		}
		
		this.geometry.attributes.position.needsUpdate = true;
	}
	//Static method for main class
	static updateAll(){
		for(var i = 0; i < particleArrays.length; i++){
			particleArrays[i].update();
		}
	}
	//Static method for main 
	static getArray(index){
		return particleArrays[index];
	}
}

var camera;
var scene;
var renderer;
 
var clock;
var deltaTime;

document.addEventListener("DOMContentLoaded", init);

function main(){
	scene.add(new ParticleArray());
}

function init() {
	
    clock = new THREE.Clock(true);
	
	deltaTime = clock.getDelta(); //for initiation of particles
     
    scene = new THREE.Scene();
	
	//RENDERER
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0x7c949c, 1 );
	document.body.appendChild( renderer.domElement );
	
	//CAMERA
    camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(0,0,50);
	
	//LIGHT
    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, -1, 1 ).normalize();
    scene.add(light);
	
	window.addEventListener( 'resize', onWindowResize, false );
	
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 0, 0 );
	controls.update();
	
	main();
	
	animate();
}

function animate() {
    deltaTime = clock.getDelta(); //Time
	time = Date.now() * 0.005;
		
	ParticleArray.updateAll();

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