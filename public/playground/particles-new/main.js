import * as THREE from './lib/three.module.js';
import Stats from './lib/stats.module.js';
import {Graph, Line} from './modules/graph.js';
import Emitter from './modules/emitter.js'

var renderer, scene, camera, stats, graph, lines;

var particleSystem, uniforms, geometry;

var particles = 1000;

init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );

	scene = new THREE.Scene();
	
	
	particleSystem = new Emitter();
	
	//Add the particle system's points group.
	scene.add( particleSystem.points );

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	var container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );

	stats = new Stats();
	container.appendChild( stats.dom );
	
	graph = new Graph();
	lines = {};
	container.appendChild( graph.dom );
	
	//Add line from constructor method
	lines.sin = new Line("sin", "white", 1, -1);
	graph.add(lines.sin);
	
	//Add line from addLine method
	lines.cos = graph.createLine("cos", "red", -1, 1);
	
	lines.shit = graph.createLine("shit", "cyan", -50, 10);
	
	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
	
	var time = Date.now() * 0.0005;

	camera.position.x = 500 * Math.cos(time / 20);
	camera.position.z = 500 * Math.sin(time / 20);
	
	camera.lookAt(new THREE.Vector3(0,0,0));
	
	particleSystem.animate();
	
	lines.sin.update(Math.sin(time));
	lines.cos.update(Math.cos(time));
	lines.shit.update(10 * Math.sin(time));

	render();
	
	requestAnimationFrame( animate );
}

function render() {
	
	renderer.render( scene, camera );
	
	stats.update();
	graph.draw();
	
}
