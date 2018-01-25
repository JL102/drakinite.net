
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


function lerp(v0, v1, t) {
    return v0*(1-t)+v1*t
}