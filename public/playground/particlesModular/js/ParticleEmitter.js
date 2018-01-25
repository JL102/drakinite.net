
function ParticleEmitter(param){ //takes an object
	
	if(!param){
		param = {};
	}
	if(!param.physics){
		param.physics = {};
	}
	
	//EMITTER SETTINGS
	this.enabled = true;
	this.rate = param.rate ? param.rate : 1000;
	this.position = param.position ? param.position : new THREE.Vector3( 0,0,0 )
	this.size = param.size ? param.size : new THREE.Vector3(0,0,0);
	this.type = param.type ? param.type : "Random"; //random, directional
	this.particle = {
		velocity: 10,
		velocityRandom: 0,
		velocityDir: new THREE.Vector3(0,20,0),
		velocityDirRandom: 15,
		
		duration: 2,
		startSize: 1,
		endSize: 1,
		
		colorStart: new THREE.Color(0xffffff),
		colorEnd: new THREE.Color(0xffffff),
		colorRandom: 0,
		alphaStart: 1,
		alphaEnd: 1
	};
	this.physics = {
		air: param.physics.air ? param.physics.air : 0,
		gravity: param.physics.gravity ? param.physics.gravity : 0
	};
	
	//VARIABLE INIT
	//var particleSystem;
	var maxParticles;

	var uniforms;
	var geometry, texture, shaderMaterial;
	var positions, colors, sizes, alphas, visible, ages, velocities, colorStarts, colorEnds;
	var positionsArray, colorsArray, sizesArray, alphasArray;
	
	geometry = new THREE.BufferGeometry();
	texture = new THREE.TextureLoader().load("images/particle-0.png");
	
	//CUSTOM SHADER SHIZ
	
	//Values that are constant for all particles during a draw call
	uniforms = {
		color:     	{ type: 'c', value: new THREE.Color( 0xffffff ) },
		texture:   	{ type: 't', value: texture },
	};
	
	//Material	
	shaderMaterial = new THREE.ShaderMaterial({
		
		uniforms:	uniforms,
		vertexShader: document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
		transparent: true,
		//alphaTest: 0.5,
		depthTest: false,
		blending: THREE.AdditiveBlending
	});
	
	this.initializeParticles = function(){
		
		maxParticles = this.rate * this.particle.duration + this.rate + 1;
		this.particleInfo = []; //must reset particleInfo
		scene.remove(this.particleSystem);
		
		positionsArray = new Float32Array(maxParticles * 3);
		colorsArray = new Float32Array(maxParticles * 3);
		sizesArray = new Float32Array(maxParticles);
		alphasArray = new Float32Array(maxParticles);
		
		velocities = new Float32Array(maxParticles * 3);
		ages = new Float32Array(maxParticles);
		visible = new Uint8Array(maxParticles);
		colorStarts = new Array();
		colorEnds = new Array();
		colorStarts.fill( new THREE.Color() );
		colorEnds.fill( new THREE.Color() );
		
		geometry.addAttribute( 'position', new THREE.BufferAttribute( positionsArray, 3) );
		geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colorsArray, 3) );
		geometry.addAttribute( 'size', new THREE.BufferAttribute( sizesArray, 1) );
		geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphasArray, 1) );
		
		positions = geometry.attributes.position.array;
		colors = geometry.attributes.customColor.array;
		alphas = geometry.attributes.alpha.array;
		sizes = geometry.attributes.size.array;
		
		//Velocities, ages, colorStart/etc are already initialized
		
		//Creates particle system
		this.particleSystem = new THREE.Points( geometry, shaderMaterial );

		scene.add(this.particleSystem); 
	}
	
	this.initializeParticles();

	this.updateParticles = function(deltaTime) {
		
		if(this.enabled == true){
				
			var numToDo = this.rate * deltaTime;
			
			for(var i = 0, i3 = 0; i < maxParticles; i++, i3 += 3){
						
				if( visible[i] === 1 ){
					
					//Animate particles
					
					//Velocity
					positions[i3 + 0] += velocities[i3 + 0] * deltaTime;
					positions[i3 + 1] += velocities[i3 + 1] * deltaTime;
					positions[i3 + 2] += velocities[i3 + 2] * deltaTime;
					
					//Air resistance
					velocities[i3 + 0] *= 1 - ( this.physics.air  * deltaTime);
					velocities[i3 + 1] *= 1 - ( this.physics.air  * deltaTime);
					velocities[i3 + 2] *= 1 - ( this.physics.air  * deltaTime);
					
					//Gravity
					velocities[i3 + 1] -= this.physics.gravity * 5 * deltaTime;
					
					//Lerp size
					sizes[i] = lerp( this.particle.startSize, this.particle.endSize,
									ages[i] / this.particle.duration);
									
					//Lerp alpha
					alphas[i] = lerp( this.particle.alphaStart, this.particle.alphaEnd,
									ages[i] / this.particle.duration);
					
					//Lerp color
					colors[i3 + 0] = lerp( colorStarts[ i3 + 0 ], colorEnds[ i3 + 0 ],
									ages[i] / this.particle.duration);
					colors[i3 + 1] = lerp( colorStarts[ i3 + 1 ], colorEnds[ i3 + 1 ],
									ages[i] / this.particle.duration);
					colors[i3 + 2] = lerp( colorStarts[ i3 + 2 ], colorEnds[ i3 + 2 ],
									ages[i] / this.particle.duration);
					
					//Increase age
					ages[i] += deltaTime;

					
					if( ages[i] >= this.particle.duration ){
						
						//Delete particle
						visible[i] = 0;
						ages[i] = 0;
						alphas[i] = 0;
					}
				}else if( numToDo > 0 && visible[i] != 1 ){
					
					//If you still have more particles to create
					this.createNewParticle( i, i3 );
								
					numToDo--;
				}
			}
			
			geometry.attributes.size.needsUpdate = true;
			geometry.attributes.alpha.needsUpdate = true;
			geometry.attributes.position.needsUpdate = true;
			geometry.attributes.customColor.needsUpdate = true;
		}
	}

	this.createNewParticle = function( i, i3 ){
				
		visible[i] = 1;
		
		if( this.type == "Random" ){
			var	angAmt = this.particle.velocity * (1 - Math.random() * this.particle.velocityRandom );
			
			var u = Math.random();
			var v = Math.random();
			var theta = 2 * Math.PI * u;
			var phi = Math.acos(2 * v - 1);
			
			velocities[i3 + 0] = angAmt * Math.sin(phi) * Math.cos(theta);
			velocities[i3 + 1] = angAmt * Math.sin(phi) * Math.sin(theta);
			velocities[i3 + 2] = angAmt * Math.cos(phi);
		}else{
			velocities[i3 + 0] = this.particle.velocityDir.x + Math.random() * this.particle.velocityDirRandom - this.particle.velocityDirRandom/2;
			velocities[i3 + 1] = this.particle.velocityDir.y + Math.random() * this.particle.velocityDirRandom - this.particle.velocityDirRandom/2;
			velocities[i3 + 2] = this.particle.velocityDir.z + Math.random() * this.particle.velocityDirRandom - this.particle.velocityDirRandom/2;
		}
		
		// Random position within bounds
		positions[i3 + 0] = this.position.x + Math.random() * this.size.x - this.size.x/2;
		positions[i3 + 1] = this.position.y + Math.random() * this.size.y - this.size.y/2;
		positions[i3 + 2] = this.position.z + Math.random() * this.size.z - this.size.z/2;
			   
		//color.setHSL( i / maxParticles, 1.0, 0.5);
		
		var rRandom = Math.pow(Math.random(),2);
		var gRandom = Math.pow(Math.random(),2);
		var bRandom = Math.pow(Math.random(),2);
				
		colorStarts[ i3 + 0 ] = lerp( this.particle.colorStart.r, rRandom, this.particle.colorRandom );
		colorStarts[ i3 + 1 ] = lerp( this.particle.colorStart.g, gRandom, this.particle.colorRandom );
		colorStarts[ i3 + 2 ] = lerp( this.particle.colorStart.b, bRandom, this.particle.colorRandom );
		colorEnds[ i3 + 0 ] = lerp( this.particle.colorEnd.r, rRandom, this.particle.colorRandom );
		colorEnds[ i3 + 1 ] = lerp( this.particle.colorEnd.g, gRandom, this.particle.colorRandom );
		colorEnds[ i3 + 2 ] = lerp( this.particle.colorEnd.b, bRandom, this.particle.colorRandom );
		colors[i3 + 0] = colorStarts[i3 + 0];
		colors[i3 + 1] = colorStarts[i3 + 1];
		colors[i3 + 2] = colorStarts[i3 + 2];
		
		alphas[ i ] = 1 * this.particle.alpha; //Math.random();
		
		sizes[ i ] = this.particle.size;
		
	}
}