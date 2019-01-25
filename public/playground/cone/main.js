var scene = new THREE.Scene();
var width = window.innerWidth;
var height = window.innerHeight;
var camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
//var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( width, height );
document.body.appendChild( renderer.domElement );

//cone
var cone;

var loader = new THREE.GLTFLoader();

loader.load( 'cone.glb', function ( gltf ) {
	cone = gltf;
	while(cone.scene.children.length > 0){
		let object = cone.scene.children[0];
		scene.add(object);
	}
	//scene.add(cone.scene);

}, undefined, function ( error ) {

	console.error( error );

} );

//light
var pointLight = new THREE.PointLight( 0xffffff, 1, 100, 0.2);
pointLight.position.set( 5, 5, 5 );
scene.add( pointLight );

var pointLight2 = new THREE.PointLight( 0xffffff, 1, 100, 0.2 );
scene.add( pointLight2 );

camera.position.x = 10;
camera.position.y = 10;
camera.lookAt(0,0,0);
camera.zoom = 40;
camera.updateProjectionMatrix();

function animate() {
	requestAnimationFrame( animate );
	//pointLight2.position.y = Math.cos(Date.now()/500)*10;
	//pointLight2.position.z = Math.sin(Date.now()/500)*10;
	//cone.scene.rotation.y =Math.sin(Date.now()/500)*10;
	renderer.render( scene, camera );
}
animate();