var camera;
var cameraPOI;
var scene;
var renderer;
var cubeMesh;
 
var clock;
var deltaTime;
 
var particleSystem;

init();

particleSystem = createParticleSystem();
  scene.add(particleSystem);

animate();

 
function init() {
 
    clock = new THREE.Clock(true);
     
    scene = new THREE.Scene();
	
	//Camera ==================================
	//NOTE: camera.rotation.x is vertical, .y is horizontal, .z is yaw
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 50;
	
	camera.poi = new THREE.Vector3();
	camera.poi.x = 100;
	camera.poi.y = 12;
	camera.poi.z = 101;
	
	CameraPOI = new THREE.Vector3( 0.1,0.1,0.1 ); //CANNOT have values of zero!
    
	
	//Light ===================================
    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, -1, 1 ).normalize();
    scene.add(light);
  
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0x7c949c, 1 );
    document.body.appendChild( renderer.domElement );
 
    window.addEventListener( 'resize', onWindowResize, false );
         
    render();
}

function animate() {
    deltaTime = clock.getDelta();
     
    //camera.rotation.y += .3 * deltaTime;
    
	camera.poi.x += 10 * deltaTime;
	camera.poi.y += 10 * deltaTime;
	//camera.rotation.y += 1 * deltaTime;
	updateCamera();
   
    render();
	//animateParticles();
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
     
    // The number of particles in a particle system is not easily changed.
    var particleCount = 2000;
     
    // Particles are just individual vertices in a geometry
    // Create the geometry that will hold all of the vertices
    var particles = new THREE.Geometry();
 
    // Create the vertices and add them to the particles geometry
    for (var p = 0; p < particleCount; p++) {
     
        // This will create all the vertices in a range of -200 to 200 in all directions
        var x = Math.random() * 400 - 200;
        var y = Math.random() * 400 - 200;
        var z = Math.random() * 400 - 200;
               
        // Create the vertex
        var particle = new THREE.Vector3(x, y, z);
         
        // Add the vertex to the geometry
        particles.vertices.push(particle);
    }
	 
    // Create the material that will be used to render each vertex of the geometry
    var particleMaterial = new THREE.PointsMaterial(
            {color: 0x55555, 
             size: 30,
             map: THREE.ImageUtils.loadTexture("images/snowflake.png"),
			 depthTest: false,
             blending: THREE.AdditiveBlending,
             transparent: true,
            });
      
    // Create the particle system
    particleSystem = new THREE.Points(particles, particleMaterial);
 
    return particleSystem;  
}

function animateParticles() {
	
    var verts = particleSystem.geometry.vertices;
    for(var i = 0; i < verts.length; i++) {
        var vert = verts[i];
        if (vert.y < -200) {
            vert.y = Math.random() * 400 - 200;
        }
        vert.y = vert.y - (10 * deltaTime);
    }
    particleSystem.geometry.verticesNeedUpdate = true;
    
}

function updateCamera(){
	
	//Updates position based on point of interest
	var newPos = new THREE.Vector3();
	newPos = CameraPOI.clone().add( camera.poi );
	
	camera.position.set( newPos.x, newPos.y, newPos.z );
	
	//Updates rotation based on point of interest
	var distance = camera.position.distanceTo( CameraPOI );
	var x = Math.asin( ( CameraPOI.y - camera.position.y ) / distance  ); //Euler x is vector y
	var y = Math.asin( ( camera.position.x - CameraPOI.x ) / distance ); //Euler y is vector x and z
	var z = 0; //Z is yaw. Not worrying about that for now.
	
	camera.rotation.set( x, y, z );
	
}






