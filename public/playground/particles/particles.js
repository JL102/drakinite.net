var camera;
var cameraPOI;
var scene;
var renderer;
var cubeMesh;
 
var clock;
var deltaTime;
 
var particleSystem;

var angX = 0, angY = 0, angZ = 0;
var dx = 0, dy = 0, dz = 0;
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
	
	/*unneeded
	camera.poi = new THREE.Vector3();
	camera.poi.x = 100;
	camera.poi.y = 12;
	camera.poi.z = 101;
	*/
	
	camera.param = { 
		r: 200, //radius
		y: 1, //vertical angle
		angle: 1 //horizontal angle
	};
	
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
    
	angX += dx * deltaTime;
	angY += dy * deltaTime;
	angY += dz * deltaTime;
	
	camera.param.angle += .5 * deltaTime;
	if(camera.param.y >= 1.5){
		camera.param.y = -1.5;
	}
	
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
    var particleCount = 2500;
     
    // Particles are just individual vertices in a geometry
    // Create the geometry that will hold all of the vertices
    var particles = new THREE.Geometry();
 
    // Create the vertices and add them to the particles geometry
    for (var p = 0; p < particleCount; p++) {
     
        // This will create all the vertices in a range of -200 to 200 in all directions
        var x = Math.random() * 600 - 300;
        var y = Math.random() * 600 - 300;
        var z = Math.random() * 600 - 300;
               
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
	
	/* Creates positioning based on y being a value instead of angle
	var y = camera.param.y + CameraPOI.y;
	
	var horX = Math.sin( camera.param.angle ) * camera.param.r
	var horZ = Math.cos( camera.param.angle ) * camera.param.r
	*/
	
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
	
	/*
	var angX = camera.param.y * -1; //Euler x is vector y
	var angY = camera.param.angle; //Euler y is vector x and z
	var angZ = 0; //Z is yaw. Not worrying about that for now.
	*/
	
	var dx = x - CameraPOI.x;
	var dy = y - CameraPOI.y;
	var dz = z - CameraPOI.z;
	/*
	var rotx = Math.atan2( dy, dz )
	var roty = Math.atan2( dx * Math.cos(rotx), dz )
	var rotz = Math.atan2( Math.cos(rotx), Math.sin(rotx) * Math.sin(roty) )
	*/
	
	var rotx = Math.atan2( dy, dz );
	 if (dz >= 0) {
		var roty = -Math.atan2( dx * Math.cos(rotx), dz );
	 }else{
		var roty = Math.atan2( dx * Math.cos(rotx), -dz );
	 }
	
	var rotz = Math.atan2( Math.cos(rotx), Math.sin(rotx) * Math.sin(roty) );
	
	camera.rotation.set( rotx, -roty, rotz, 'XYZ' );
	
}






