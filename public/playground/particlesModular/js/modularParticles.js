var maxParticles = 100000; //Max particles for each instance of each emitter.

function ParticleArray(params){ //takes an object
	
	if(!params){
		params = {};
	}
	if( params.type == "random" ){ //randomness thingymabob
		var type = "random";
	}else if(params.type = "grid"){
		var type = "grid";
	}
	
	//EMITTER SETTINGS
	this.particleInfo = [];
	this.position = params.position ? params.position : new THREE.Vector3(0,0,0),
	this.size = params.size ? params.size : new THREE.Vector3(0,0,0);
	this.density = .4;//num of particles per 10 units, if random is set to false
	this.particle = {
		velocity: 0,
		velocityRandom: 0,
		
		duration: 2,
		maxSize: 1,
		minSize: 1,
		
		color: new THREE.Color(0xb53c3c),
		colorRandom: 0
	};
	this.physics = {
		air: 0,
		gravity: 0
	};
	
	//VARIABLE INIT
	this.particleSystem;
	var maxParticles;

	var uniforms;
	var geometry, texture, shaderMaterial;
	var positions, colors, sizes, alphas;
	
	maxParticles = this.size.x * this.size.y * this.size.z * ( Math.pow( this.density , 3 ) ) ;
		
 
	geometry = new THREE.BufferGeometry();
	texture = new THREE.TextureLoader().load("images/snowflake.png");
	
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
	
	positions = new Float32Array(maxParticles * 3);
	colors = new Float32Array(maxParticles * 3);
	sizes = new Float32Array(maxParticles);
	alphas = new Float32Array(maxParticles);

	//INITIALIZE PARTICLES
	
	noise.seed(Math.random()); //seed dat noise
	  
	for (var i = 0, i3 = 0; i < maxParticles; i++, i3 += 3) {
		
		this.particleInfo.push({
			index: i,
			index3: i3,
			visible: true,
			age: 0,
			velocity: {
				x: 0,
				y: 0,
				z: 0
			},
			position: {
				x: 0,
				y: 0,
				z: 0
			},
			size: 0,
		});
		
		var p = this.particleInfo[i];
	 
		p.visible = true;
		
		var	angAmt = this.particle.velocity * (1 - Math.random() * this.particle.velocityRandom );
		
		var u = Math.random();
		var v = Math.random();
		var theta = 2 * Math.PI * u;
		var phi = Math.acos(2 * v - 1);
		
		p.velocity.x = angAmt * Math.sin(phi) * Math.cos(theta);
		p.velocity.y = angAmt * Math.sin(phi) * Math.sin(theta);
		p.velocity.z = angAmt * Math.cos(phi);
		
		if(type == "random"){
			// Random position within bounds
			positions[ i3 + 0 ] = this.position.x + Math.random() * this.size.x - this.size.x/2;
			positions[ i3 + 1 ] = this.position.y + Math.random() * this.size.y - this.size.y/2;
			positions[ i3 + 2 ] = this.position.z + Math.random() * this.size.z - this.size.z/2;
			
		}else{
			var numX = this.size.x * this.density;
			var numY = this.size.y * this.density;
			var numZ = this.size.z * this.density;
			
			var locX = i % numX;
			var locY = Math.floor( i / numX ) % numY;
			var locZ = Math.floor( i / numX / numY) % numZ;
			
			p.position.x = this.position.x + locX / this.density - this.size.x / 2;
			p.position.y = this.position.y + locY / this.density - this.size.y / 2;
			p.position.z = this.position.z + locZ / this.density - this.size.z / 2;
			
			var scale = 10;
			
			var value = noise.simplex3(locX / scale, locY / scale, locZ / scale);
			
			value = (this.particle.minSize + value) * (this.particle.maxSize / 2);
						
			//p.size = value; TEMPORARILY DISABLING SIZE BIDNIZZ BECAUSE YEH
			p.size = this.particle.maxSize;

		}

			   
		//color.setHSL( i / maxParticles, 1.0, 0.5);
		
		colors[ i3 + 0 ] = lerp( this.particle.color.r, Math.pow(Math.random(),2), 
			this.particle.colorRandom ); //color.r;
		colors[ i3 + 1 ] = lerp( this.particle.color.g, Math.pow(Math.random(),2), 
			this.particle.colorRandom ); //color.g;
		colors[ i3 + 2 ] = lerp( this.particle.color.b, Math.pow(Math.random(),2), 
			this.particle.colorRandom ); //color.b;
		
		alphas[ i ] = 1; //Math.random();
		
		//sizes[ i ] = this.particle.size;
				
	} 
	
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3) );
	geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3) );
	geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1) );
	geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1) );//not yet working
	
	//Creates particle system
	this.particleSystem = new THREE.Points( geometry, shaderMaterial );

	scene.add(this.particleSystem);  

	this.updateParticles = function() {
		
		var positions = geometry.attributes.position.array;
		var colors = geometry.attributes.customColor.array;
		var alphas = geometry.attributes.alpha.array;
		var sizes = geometry.attributes.size.array;
		
		var p = this.particleInfo;
		var numToDo = this.rate * deltaTime;
		
		for(var i = 0; i < this.particleInfo.length; i++){
				
				//Animate particles
				
				//Velocity
				p[i].position.x += p[i].velocity.x /60;// * deltaTime;
				p[i].position.x += p[i].velocity.y /60;//* deltaTime;
				p[i].position.x += p[i].velocity.z /60;//* deltaTime;
				
				//Air resistance
				p[i].velocity.x *= 1 - ( this.physics.air / 10 );
				p[i].velocity.y *= 1 - ( this.physics.air / 10 );
				p[i].velocity.z *= 1 - ( this.physics.air / 10 );
				
				//Gravity
				p[i].velocity.y -= this.physics.gravity;
				
				//Lerp size
				/*sizes[i] = lerp( this.particle.startSize, this.particle.endSize,
									p[i].age / this.particle.duration);
				*/
				//Increase age
				p[i].age += deltaTime;
				
				//Updates array from properties object
				positions[p[i].index3 + 0] = p[i].position.x;
				positions[p[i].index3 + 1] = p[i].position.y;
				positions[p[i].index3 + 2] = p[i].position.z;
				
				sizes[i] = p[i].size;
				
		}
		
		geometry.attributes.size.needsUpdate = true;
		geometry.attributes.alpha.needsUpdate = true;
		geometry.attributes.position.needsUpdate = true;
		geometry.attributes.customColor.needsUpdate = true;
	}

	
}

class ParticleArrayBad{
	constructor(param){
		
		param = param ? param : {};
		param.physics = param.physics ? param.physics : {};
		
		this.position = param.position ? param.position : new THREE.Vector3(0,0,0);
		this.size = param.size ? param.size : new THREE.Vector3(50,50,50);
		this.spacing = param.spacing ? param.spacing : new THREE.Vector3(5,5,5);
		
		this.physics = {
			air: param.physics.air ? param.physics.air : 0,
			gravity: param.physics.gravity ? param.physics.gravity : 0,
			repulsion: param.physics.repulsion ? param.physics.repulsion : {
				pow: 30,
				radius: 0,
				falloff: 50
			},
			attraction: param.physics.attraction ? param.physics.attraction : {
				pow: 60,
				radius: 50,
				falloff: 200
			}
		};
		
		this.instances = [];
		
		this.maxParticles = Math.floor( this.size.x / this.spacing.x ) * 
			Math.floor( this.size.y / this.spacing.y ) * 
			Math.floor( this.size.z / this.spacing.z );
		
		this.initialize();
		this.createParticles();
	}
	
	initialize(){
		var positions, colors, sizes, alphas, visible, ages, velocities, colorStarts, colorEnds,
			positionsArray, colorsArray, sizesArray, alphasArray;
		
		this.geometry = new THREE.BufferGeometry();
				
		positionsArray = new Float32Array(maxParticles * 3);
		colorsArray = new Float32Array(maxParticles * 3);
		sizesArray = new Float32Array(maxParticles);
		alphasArray = new Float32Array(maxParticles);
		
		this.velocities = new Float32Array(maxParticles * 3);
		this.ages = new Float32Array(maxParticles);
		this.visible = new Uint8Array(maxParticles);
		this.colorStarts = new Array();
		this.colorEnds = new Array();
		this.colorStarts.fill( new THREE.Color() );
		this.colorEnds.fill( new THREE.Color() );
		
		this.geometry.addAttribute( 'position', new THREE.BufferAttribute( positionsArray, 3) );
		this.geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colorsArray, 3) );
		this.geometry.addAttribute( 'size', new THREE.BufferAttribute( sizesArray, 1) );
		this.geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphasArray, 1) );
		
		this.positions = this.geometry.attributes.position.array;
		this.colors = this.geometry.attributes.customColor.array;
		this.alphas = this.geometry.attributes.alpha.array;
		this.sizes = this.geometry.attributes.size.array;
		
		//Velocities, ages, colorStart/etc are already initialized

		var texture, uniforms, shaderMaterial;
		
		texture = new THREE.TextureLoader().load("images/particle-1.png");
		
		//CUSTOM SHADER SHIZ
		
		//Values that are constant for all particles during a draw call
		uniforms = {
			color:     	{ type: 'c', value: new THREE.Color( 0xffffff ) },
			texture:   	{ type: 't', value: texture },
		};
		
		shaderMaterial = new THREE.ShaderMaterial({
			
			uniforms:	uniforms,
			vertexShader: document.getElementById( 'vertexshader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
			transparent: true,
			//alphaTest: 0.5,
			depthTest: false,
			blending: THREE.AdditiveBlending
		});
		
		//Creates particle system
		this.particleSystem = new THREE.Points( this.geometry, shaderMaterial );

		scene.add(this.particleSystem); 
	}
	
	createParticles(){
		
		var numX = this.size.x / this.spacing.x;
		var numY = this.size.y / this.spacing.y;
		var numZ = this.size.z / this.spacing.z;
		var index = 0, i3 = 0;
		for(var i = 0; i < numX; i++){
			for(var j = 0; j < numY; j++){
				for(var k = 0; k < numZ; k++){
					
					this.positions[i3 + 0] = this.position.x + Math.random() * this.size.x - this.size.x/2;
					this.positions[i3 + 1] = this.position.y + Math.random() * this.size.y - this.size.y/2;
					this.positions[i3 + 2] = this.position.z + Math.random() * this.size.z - this.size.z/2;
					
					index++;
					i3 += 3;
				}
			}
		}
	}
	
	updateParticles(deltaTime){
		
		if(!deltaTime){
			console.error("deltaTime must be included in arguments.");
		}
		
		var numInst = this.instances.length; //number of instances for the count
		var numToDo = this.rate * deltaTime;
		var p = 0; //which instance this particle is a part of; increased at end of for loop
		
		/*
		for(var i = 0, i3 = 0; i < this.maxParticles; i++ , i3 += 3){	
			
			if( this.visible[i] === 1 ){
				//Animate particles
				//console.log("e");
				//Velocity
				this.positions[i3 + 0] += this.velocities[i3 + 0] * deltaTime;
				this.positions[i3 + 1] += this.velocities[i3 + 1] * deltaTime;
				this.positions[i3 + 2] += this.velocities[i3 + 2] * deltaTime;
				
				//Air resistance
				this.velocities[i3 + 0] *= 1 - ( this.physics.air  * deltaTime);
				this.velocities[i3 + 1] *= 1 - ( this.physics.air  * deltaTime);
				this.velocities[i3 + 2] *= 1 - ( this.physics.air  * deltaTime);
				
				//Gravity
				this.velocities[i3 + 1] -= this.physics.gravity * 5 * deltaTime;
				
				//Lerp size
				this.sizes[i] = lerp( this.instances[p].startSize, this.instances[p].endSize, this.ages[i] / this.instances[p].duration);
								
				//Lerp alpha
				this.alphas[i] = lerp( this.instances[p].alphaStart, this.instances[p].alphaEnd, this.ages[i] / this.instances[p].duration);
				
				//Lerp color
				this.colors[i3 + 0] = lerp( this.colorStarts[ i3 + 0 ], this.colorEnds[ i3 + 0 ], this.ages[i] / this.instances[p].duration);
				this.colors[i3 + 1] = lerp( this.colorStarts[ i3 + 1 ], this.colorEnds[ i3 + 1 ], this.ages[i] / this.instances[p].duration);
				this.colors[i3 + 2] = lerp( this.colorStarts[ i3 + 2 ], this.colorEnds[ i3 + 2 ], this.ages[i] / this.instances[p].duration);
				
				//Increase age
				this.ages[i] += deltaTime;

				
				if( this.ages[i] >= this.instances[p].duration ){
					
					//Delete particle
					this.visible[i] = 0;
					this.ages[i] = 0;
					this.alphas[i] = 0;
				}
			}else if( numToDo > 0 && this.visible[i] != 1 ){
				
				//If you still have more particles to create
				this.createNewParticle(p, i, i3 );
							
				numToDo--;
			}
		//}
		
			this.geometry.attributes.size.needsUpdate = true;
			this.geometry.attributes.alpha.needsUpdate = true;
			this.geometry.attributes.position.needsUpdate = true;
			this.geometry.attributes.customColor.needsUpdate = true;
						
			p++;
			if( p >= numInst ) {
				p = 0;
			}
		}*/	
				
		this.geometry.attributes.size.needsUpdate = true;
		this.geometry.attributes.alpha.needsUpdate = true;
		this.geometry.attributes.position.needsUpdate = true;
		this.geometry.attributes.customColor.needsUpdate = true;
	}
	
	addParticle (particleObject){ //The user calls this function. Tells the emitter to create another instance for new particlez
		this.instances.push(particleObject);
	}
}

function Emitter(param){

	if(!param){
		param = {};
	}
	if(!param.physics){
		param.physics = {};
	}
	
	this.rate = param.rate ? param.rate : 1000;
	this.position = param.position ? param.position : new THREE.Vector3(0,0,0);
	this.size = param.size ? param.size : new THREE.Vector3(0,0,0);
	this.type = "Random";
	
	this.velocity = param.velocity ? param.velocity : 10;
	this.velocityRandom = param.velocityRandom ? param.velocityRandom : 0;
	
	this.maxParticles = maxParticles;
	this.instances = []; //"Instances" is any particle objects added to this emitter.
	
	//this.visible = [];//makes visible array available everywhere in obj
	//this.geometry = new THREE.BufferGeometry;
	
	//initialize geometry
		//Double maxParticles for each instance of particle used
		//only one geometry
	//createParticle
		//initializes each particle in the geometry
		//one for each instance 
		//information for each particle is stored in the particle object, but put into the emitter's arrays
	//updateParticles
		//all the physics in here
		//most of the logic stuff is in here
	
	this.physics = {
		air: param.physics.air ? param.physics.air : 0,
		gravity: param.physics.gravity ? param.physics.gravity : 0
	};
	
	this.initialize = function(){
		//VARIABLE INIT
		var particleSystem;//??????

		var geometry;
		var positions, colors, sizes, alphas, visible, ages, velocities, colorStarts, colorEnds;
		var positionsArray, colorsArray, sizesArray, alphasArray;
		
		this.geometry = new THREE.BufferGeometry();
				
		positionsArray = new Float32Array(maxParticles * 3);
		colorsArray = new Float32Array(maxParticles * 3);
		sizesArray = new Float32Array(maxParticles);
		alphasArray = new Float32Array(maxParticles);
		
		this.velocities = new Float32Array(maxParticles * 3);
		this.ages = new Float32Array(maxParticles);
		this.visible = new Uint8Array(maxParticles);
		this.colorStarts = new Array();
		this.colorEnds = new Array();
		this.colorStarts.fill( new THREE.Color() );
		this.colorEnds.fill( new THREE.Color() );
		
		this.geometry.addAttribute( 'position', new THREE.BufferAttribute( positionsArray, 3) );
		this.geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colorsArray, 3) );
		this.geometry.addAttribute( 'size', new THREE.BufferAttribute( sizesArray, 1) );
		this.geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphasArray, 1) );
		
		this.positions = this.geometry.attributes.position.array;
		this.colors = this.geometry.attributes.customColor.array;
		this.alphas = this.geometry.attributes.alpha.array;
		this.sizes = this.geometry.attributes.size.array;
		
		//Velocities, ages, colorStart/etc are already initialized

		var texture, uniforms, shaderMaterial;
		
		texture = new THREE.TextureLoader().load("images/particle-1.png");
		
		//CUSTOM SHADER SHIZ
		
		//Values that are constant for all particles during a draw call
		uniforms = {
			color:     	{ type: 'c', value: new THREE.Color( 0xffffff ) },
			texture:   	{ type: 't', value: texture },
		};
		
		shaderMaterial = new THREE.ShaderMaterial({
			
			uniforms:	uniforms,
			vertexShader: document.getElementById( 'vertexshader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
			transparent: true,
			//alphaTest: 0.5,
			depthTest: false,
			blending: THREE.AdditiveBlending
		});
		
		//Creates particle system
		this.particleSystem = new THREE.Points( this.geometry, shaderMaterial );

		scene.add(this.particleSystem); 
		
	}
	
	this.addParticle = function(particleObject){ //The user calls this function. Tells the emitter to create another instance for new particlez
		this.instances.push(particleObject);
		this.maxParticles += maxParticles; //cuz there'll be 100,000 more max particles heh
	}
	
	this.createNewParticle = function( p, i, i3 ){ //p is index of particle objects array aka instances
		
		this.visible[i] = 1;
		
		if( this.type == "Random" ){
			var	angAmt = this.velocity * (1 - Math.random() * this.velocityRandom );
			
			var u = Math.random();
			var v = Math.random();
			var theta = 2 * Math.PI * u;
			var phi = Math.acos(2 * v - 1);
			
			this.velocities[i3 + 0] = angAmt * Math.sin(phi) * Math.cos(theta);
			this.velocities[i3 + 1] = angAmt * Math.sin(phi) * Math.sin(theta);
			this.velocities[i3 + 2] = angAmt * Math.cos(phi);
		}else{
			this.velocities[i3 + 0] = this.velocityDir.x + Math.random() * this.velocityDirRandom - this.velocityDirRandom/2;
			this.velocities[i3 + 1] = this.velocityDir.y + Math.random() * this.velocityDirRandom - this.velocityDirRandom/2;
			this.velocities[i3 + 2] = this.velocityDir.z + Math.random() * this.velocityDirRandom - this.velocityDirRandom/2;
		}
		
		// Random position within bounds
		this.positions[i3 + 0] = this.position.x + Math.random() * this.size.x - this.size.x/2;
		this.positions[i3 + 1] = this.position.y + Math.random() * this.size.y - this.size.y/2;
		this.positions[i3 + 2] = this.position.z + Math.random() * this.size.z - this.size.z/2;
			   
		//color.setHSL( i / maxParticles, 1.0, 0.5);
		
		var rRandom = Math.pow(Math.random(),2);
		var gRandom = Math.pow(Math.random(),2);
		var bRandom = Math.pow(Math.random(),2);
				
		this.colorStarts[ i3 + 0 ] = lerp( this.instances[p].colorStart.r, rRandom, this.instances[p].colorRandom );
		this.colorStarts[ i3 + 1 ] = lerp( this.instances[p].colorStart.g, gRandom, this.instances[p].colorRandom );
		this.colorStarts[ i3 + 2 ] = lerp( this.instances[p].colorStart.b, bRandom, this.instances[p].colorRandom );
		
		this.colorEnds[ i3 + 0 ] = lerp( this.instances[p].colorEnd.r, rRandom, this.instances[p].colorRandom );
		this.colorEnds[ i3 + 1 ] = lerp( this.instances[p].colorEnd.g, gRandom, this.instances[p].colorRandom );
		this.colorEnds[ i3 + 2 ] = lerp( this.instances[p].colorEnd.b, bRandom, this.instances[p].colorRandom );
		
		this.colors[i3 + 0] = this.colorStarts[i3 + 0];
		this.colors[i3 + 1] = this.colorStarts[i3 + 1];
		this.colors[i3 + 2] = this.colorStarts[i3 + 2];
		
		this.alphas[ i ] = 1 * this.instances[p].alpha; //Math.random();
		
		this.sizes[ i ] = this.instances[p].startSize;
		
	}
	
	this.updateParticles = function(deltaTime){
		
		if(!deltaTime){
			console.error("deltaTime must be included in arguments.");
		}
		
		var numInst = this.instances.length; //number of instances for the count
		var numToDo = this.rate * deltaTime;
		var p = 0; //which instance this particle is a part of; increased at end of for loop
		
		for(var i = 0, i3 = 0; i < this.maxParticles; i++ , i3 += 3){
			
			if( this.visible[i] === 1 ){
				//Animate particles
				//console.log("e");
				//Velocity
				this.positions[i3 + 0] += this.velocities[i3 + 0] * deltaTime;
				this.positions[i3 + 1] += this.velocities[i3 + 1] * deltaTime;
				this.positions[i3 + 2] += this.velocities[i3 + 2] * deltaTime;
				
				//Air resistance
				this.velocities[i3 + 0] *= 1 - ( this.physics.air  * deltaTime);
				this.velocities[i3 + 1] *= 1 - ( this.physics.air  * deltaTime);
				this.velocities[i3 + 2] *= 1 - ( this.physics.air  * deltaTime);
				
				//Gravity
				this.velocities[i3 + 1] -= this.physics.gravity * 5 * deltaTime;
				
				//Lerp size
				this.sizes[i] = lerp( this.instances[p].startSize, this.instances[p].endSize, this.ages[i] / this.instances[p].duration);
								
				//Lerp alpha
				this.alphas[i] = lerp( this.instances[p].alphaStart, this.instances[p].alphaEnd, this.ages[i] / this.instances[p].duration);
				
				//Lerp color
				this.colors[i3 + 0] = lerp( this.colorStarts[ i3 + 0 ], this.colorEnds[ i3 + 0 ], this.ages[i] / this.instances[p].duration);
				this.colors[i3 + 1] = lerp( this.colorStarts[ i3 + 1 ], this.colorEnds[ i3 + 1 ], this.ages[i] / this.instances[p].duration);
				this.colors[i3 + 2] = lerp( this.colorStarts[ i3 + 2 ], this.colorEnds[ i3 + 2 ], this.ages[i] / this.instances[p].duration);
				
				//Increase age
				this.ages[i] += deltaTime;

				
				if( this.ages[i] >= this.instances[p].duration ){
					
					//Delete particle
					this.visible[i] = 0;
					this.ages[i] = 0;
					this.alphas[i] = 0;
				}
			}else if( numToDo > 0 && this.visible[i] != 1 ){
				
				//If you still have more particles to create
				this.createNewParticle(p, i, i3 );
							
				numToDo--;
			}
		//}
		
			this.geometry.attributes.size.needsUpdate = true;
			this.geometry.attributes.alpha.needsUpdate = true;
			this.geometry.attributes.position.needsUpdate = true;
			this.geometry.attributes.customColor.needsUpdate = true;
						
			p++;
			if( p >= numInst ) {
				p = 0;
			}
		}
	}
	
}

function Particle(param){
	if(!param){
		param = {};
	}
	if(!param.physics){
		param.physics = {};
	}

	this.startSize = param.startSize ? param.startSize : 1,
	this.endSize = param.endSize ? param.endSize : 1,
	this.duration = param.duration ? param.duration : 3,
	
	this.colorStart = param.colorStart ? param.colorStart : new THREE.Color(0xffffff),
	this.colorEnd = param.colorEnd ? param.colorEnd : new THREE.Color(0xffffff),
	this.colorRandom = param.colorRandom ? param.colorRandom : 0,
	this.alphaStart = param.alphaStart ? param.alphaStart : 1,
	this.alphaEnd = param.alphaEnd ? param.alphaEnd : 1
	
	this.physics = {
		air: param.physics.air ? param.physics.air : 0,
		gravity: param.physics.gravity ? param.physics.gravity : 0
	};
}

function lerp(v0, v1, t) {
    return v0*(1-t)+v1*t
}