import * as THREE from '../lib/three.module.js';
class Emitter{
	
	constructor(){
		
		//Texture
		var uniforms = {
			pointTexture: { value: new THREE.TextureLoader().load( "sprites/spark1.png" ) }
		};
		
		//Get vertex and fragment shaders from AJAX
		var vertexShaderText = $.ajax("vertexshader.glsl", {async: false}).responseText;
		var fragmentShaderText = $.ajax("fragmentshader.glsl", {async: false}).responseText;
		
		//create shader material
		var shaderMaterial = new THREE.ShaderMaterial( {
			
			uniforms: uniforms,
			vertexShader: vertexShaderText,
			fragmentShader: fragmentShaderText,
			
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true,
			vertexColors: true
			
		} );
		
		this.particles = 1000000;
		
		var radius = 5000;
		
		this.geometry = new THREE.BufferGeometry();
		
		var positions = [];
		var colors = [];
		var sizes = [];
		
		var color = new THREE.Color();
		
		for ( var i = 0; i < this.particles; i ++ ) {
			
			positions.push( ( Math.random() * 2 - 1 ) * radius );
			positions.push( ( Math.random() * 2 - 1 ) * radius );
			positions.push( ( Math.random() * 2 - 1 ) * radius );
			
			color.setHSL( i / this.particles, 1.0, 0.5 );
			
			colors.push( color.r, color.g, color.b );
			
			sizes.push( 10 );
			
		}
		
		this.geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ).setDynamic(true) );
		this.geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
		this.geometry.addAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setDynamic( true ) );
		
		this.points = new THREE.Points( this.geometry, shaderMaterial );
		
		//Web Worker
		this.worker = new Worker('modules/webworkers/emitter_webworker.js');
		
		this.worker.postMessage(this.geometry.attributes.size.array);
	}
	
	animate(){
		
		/*
		var sizes = this.geometry.attributes.size.array;
		var sizeObject = this.geometry.attributes.size;
		
		this.worker.postMessage([this.particles, sizes]);
		
		this.worker.onmessage = function(e){
			
			for(var i in e.data){
				sizes[i] = e.data[i];
			}
			
			sizeObject.needsUpdate = true;
			
		}
		
		*/
		//var positions = this.geometry.attributes.position.array;
		/*
		for(var i = 0; i < this.particles; i += 3){
			
			positions[i] = ( Math.random() * 2 - 1 ) * 100;
			positions[i+1] = ( Math.random() * 2 - 1 ) * 100;
			positions[i+2] = ( Math.random() * 2 - 1 ) * 100;
			
		}
		
		this.geometry.attributes.position.needsUpdate = true;
		
		*/
		var time = Date.now() * 0.005;
		
		var sizes = this.geometry.attributes.size.array;
		
		for ( var i = 0; i < this.particles; i ++ ) {
			
			sizes[ i ] = 100 * ( 1 + Math.sin( 0.1 * i + time ) );
			
		}
		
		this.geometry.attributes.size.needsUpdate = true;
		//*/
	}
}

export default Emitter;