
function ParticleEmitter(param){ //takes an object
	
	if(!param){
		param = {};
	}
	if(!param.physics){
		param.physics = {};
	}
	
	//EMITTER SETTINGS
	this.particleInfo = [];
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
		
		color: new THREE.Color(0xffffff),
		colorRandom: 0
	};
	this.physics = {
		air: param.physics.air ? param.physics.air : 0,
		gravity: param.physics.gravity ? param.physics.gravity : 0
	};
	
	//VARIABLE INIT
	var particleSystem;
	var maxParticles;

	var uniforms;
	var geometry, texture, shaderMaterial;
	var positions, colors, sizes, alphas;
	
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
	
	this.initializeParticles = function(){
		
		maxParticles = this.rate * this.particle.duration + this.rate + 1;
		this.particleInfo = []; //must reset particleInfo
		scene.remove(particleSystem);
		
		positions = new Float32Array(maxParticles * 3);
		colors = new Float32Array(maxParticles * 3);
		sizes = new Float32Array(maxParticles);
		alphas = new Float32Array(maxParticles);
		
		
		//INITIALIZE PARTICLES
		for (var i = 0, i3 = 0; i < maxParticles; i++, i3 += 3) {
		 
			// ZERO ALL THE THINGS
			positions[ i3 + 0 ] = 0;
			positions[ i3 + 1 ] = 0;
			positions[ i3 + 2 ] = 0;
			
			colors[ i3 + 0 ] = 0;
			colors[ i3 + 1 ] = 0;
			colors[ i3 + 2 ] = 0;
			
			alphas[ i ] = 0;
			
			sizes[ i ] = 0;
			
			this.particleInfo.push({
				index: i,
				index3: i3,
				visible: false,
				age: 0,
				alpha: 0,
				velocity: {
					x: 0,
					y: 0,
					z: 0
				},
				position: {
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
	
	this.initializeParticles();

	this.updateParticles = function() {
		
		var positions = geometry.attributes.position.array;
		var colors = geometry.attributes.customColor.array;
		var alphas = geometry.attributes.alpha.array;
		var sizes = geometry.attributes.size.array;
		
		var p = this.particleInfo;
		var numToDo = this.rate / 60;// * deltaTime;
		
		for(var i = 0; i < this.particleInfo.length; i++){
					
			if( p[i].visible == true ){
				
				//Animate particles
				
				//Velocity
				p[i].position.x += p[i].velocity.x /60;// * deltaTime;
				p[i].position.y += p[i].velocity.y /60;//* deltaTime;
				p[i].position.z += p[i].velocity.z /60;//* deltaTime;
				
				//Air resistance
				p[i].velocity.x *= 1 - ( this.physics.air / 10 );
				p[i].velocity.y *= 1 - ( this.physics.air / 10 );
				p[i].velocity.z *= 1 - ( this.physics.air / 10 );
				
				//Gravity
				p[i].velocity.y -= this.physics.gravity;// * deltaTime * 60;
				
				//Lerp size
				p[i].size = lerp( emitter.particle.startSize, emitter.particle.endSize,
								p[i].age / emitter.particle.duration);
				
				//Increase age
				p[i].age += deltaTime;
				
				//Updates all properties from object
				positions[p[i].index3 + 0] = p[i].position.x;
				positions[p[i].index3 + 1] = p[i].position.y;
				positions[p[i].index3 + 2] = p[i].position.z;
				
				sizes[i] = p[i].size;
				
				//colors[i] = p[i].color;//not yet implemented
				
				//alphas[i] = p[i].alpha;
				
				if( p[i].age >= this.particle.duration ){
					
					//Delete particle
					p[i].visible = false;
					p[i].age = 0;
					alphas[i] = 0;
				}
			}else if( numToDo > 0 && p[i].visible != true ){
				
				//If you still have more particles to create
				this.createNewParticle( p[i], p[i].index, p[i].index3 );
							
				numToDo--;
			}
		}
		
		geometry.attributes.size.needsUpdate = true;
		geometry.attributes.alpha.needsUpdate = true;
		geometry.attributes.position.needsUpdate = true;
		geometry.attributes.customColor.needsUpdate = true;
	}

	this.createNewParticle = function(p/*Particle in info array*/, i, i3/*Indices of particle*/){
		
		var positions = geometry.attributes.position.array;
		var colors = geometry.attributes.customColor.array;
		var alphas = geometry.attributes.alpha.array;
		var sizes = geometry.attributes.size.array;
		
		p.visible = true;
		
		if( this.type == "Random" ){
			var	angAmt = this.particle.velocity * (1 - Math.random() * this.particle.velocityRandom );
			
			var u = Math.random();
			var v = Math.random();
			var theta = 2 * Math.PI * u;
			var phi = Math.acos(2 * v - 1);
			
			p.velocity.x = angAmt * Math.sin(phi) * Math.cos(theta);
			p.velocity.y = angAmt * Math.sin(phi) * Math.sin(theta);
			p.velocity.z = angAmt * Math.cos(phi);
		}else{
			p.velocity.x = this.particle.velocityDir.x + Math.random() * this.particle.velocityDirRandom - this.particle.velocityDirRandom/2;
			p.velocity.y = this.particle.velocityDir.y + Math.random() * this.particle.velocityDirRandom - this.particle.velocityDirRandom/2;
			p.velocity.z = this.particle.velocityDir.z + Math.random() * this.particle.velocityDirRandom - this.particle.velocityDirRandom/2;
		}
		
		
		
		
		// Random position within bounds
		p.position.x = this.position.x + Math.random() * this.size.x - this.size.x/2;
		p.position.y = this.position.y + Math.random() * this.size.y - this.size.y/2;
		p.position.z = this.position.z + Math.random() * this.size.z - this.size.z/2;
			   
		//color.setHSL( i / maxParticles, 1.0, 0.5);
		
		colors[ i3 + 0 ] = lerp( this.particle.color.r, Math.pow(Math.random(),2), 
			this.particle.colorRandom ); //color.r;
		colors[ i3 + 1 ] = lerp( this.particle.color.g, Math.pow(Math.random(),2), 
			this.particle.colorRandom ); //color.g;
		colors[ i3 + 2 ] = lerp( this.particle.color.b, Math.pow(Math.random(),2), 
			this.particle.colorRandom ); //color.b;
		
		alphas[ i ] = 1; //Math.random();
		
		sizes[ i ] = this.particle.size;
		
	}
}