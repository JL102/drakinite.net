var scene = new THREE.Scene();
var loader = new THREE.TextureLoader();
var camera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//stats module
if (Stats) {
	var stats = new Stats();
	// 0: fps, 1: ms, 2: mb, 3+: custom
	stats.showPanel( 0 );
	document.body.appendChild( stats.dom );
}
else var stats = {begin: ()=>{}, end: () => {}}

const NUM_ALBUMS_VISIBLE = 8;
const PICTURE_SIZE = 6;
const TOTAL_GEOMETRIES = 3 + (NUM_ALBUMS_VISIBLE * 2);
const MIN_FRAME_TIME = 500;
const FAST_MOVE_THRESHOLD = 50;
var SPACING = 1.5;

var resizeTicking = false;
var lastResize = Date.now();

class AlbumArtController{
	constructor() {
		this.arts = [];
		this.paths = [];
		this.noImage = loader.load('images/no-image.png');
		for (var i = 1; i <= 100; i++) {
			this.paths.push(`images/${i}.jpg`);
		}
	}
	getArt(index) {
		let art = this.arts[index];
		if (art && art.image) {
			return art;
		}
		else {
			//load image, but in the meantime, return the noImage bit
			if (this.paths[index]) {
				this.arts[index] = loader.load(this.paths[index]);
			}
			return this.noImage;
		}
	}
}


class Controller{
	constructor() {
		this.objects = [];
		this.position = 0;
		this.lastPosition = 0;
		this.velocity = 0;
		this.lastFrameTime = 0;
		this.target = 0;
		this.lastLeftMove = 0;
		this.lastRightMove = 0;
		this.enabled = true;
		
		this.fastMoveEnabled = true;
		
		this.albumArts = new AlbumArtController();
		let noImage = this.albumArts.noImage;
		let gradient = loader.load('images/gradient.png');
		
		this.maxPosition = 100;
		
		this.geometry = new THREE.PlaneBufferGeometry(PICTURE_SIZE, PICTURE_SIZE, 1, 1);
		let gradientMaterial = new THREE.MeshPhongMaterial({
			map: gradient, 
			opacity: 1,
			transparent: true,
		});
		
		this.objects = [];
		for (var i = 0; i < TOTAL_GEOMETRIES; i++) {
			//Regular album
			let material = new THREE.MeshBasicMaterial({map: noImage});
			let mesh =  new THREE.Mesh(this.geometry, material);
			//Reflection mesh
			let reflectionMesh = new THREE.Mesh(this.geometry, material);
			reflectionMesh.position.y = -1 * PICTURE_SIZE;
			reflectionMesh.rotation.z = -1 * Math.PI;
			reflectionMesh.scale.x = -1;
			//Gradient (for reflection)
			let gradientMesh = new THREE.Mesh(this.geometry, gradientMaterial);
			gradientMesh.position.y = -1 * PICTURE_SIZE;
			
			let pos = i - NUM_ALBUMS_VISIBLE - 1;
			this.objects[i] = {
				mesh: mesh,
				reflectionMesh: reflectionMesh,
				gradientMesh: gradientMesh,
				position: pos,
			}
			scene.add(mesh);
			scene.add(reflectionMesh);
			scene.add(gradientMesh);
		}
	}
	animate() {
		if (!this.enabled) return;
		let st = window.performance.now();
		
		if (this.velocity === 0 && Date.now() - this.lastFrameTime < MIN_FRAME_TIME) return;
		//manage velocity
		
		// Move to target, faster when target is farther away
		let diff = this.target - this.position;
		if (Math.abs(diff) > 0.001) {
			this.velocity = 0.15 * (diff);
		}
		//if we are super close, just snap
		else{
			this._snap();
		}
		
		this._setPosition(this.position + this.velocity);
		
		let a = window.performance.now();
		
		for (var i in this.objects) {
			let object = this.objects[i];
			
			//update album art for this item
			let idx = -1*this.position + object.position;
			let roundedIdx = Math.round(idx);
			if (idx - roundedIdx < 0.2) {
				let newArt = this.albumArts.getArt(roundedIdx);
				if (object.mesh.material.map.uuid !== newArt) {
					object.mesh.material.map = newArt;
				}
			}
			
			//hide if < 0 or > maximum
			if (roundedIdx >= this.maxPosition || roundedIdx < 0) {
				object.mesh.visible = false;
				object.reflectionMesh.visible = false;
				object.gradientMesh.visible = false;
			}
			else {
				object.mesh.visible = true;
				object.reflectionMesh.visible = true;
				object.gradientMesh.visible = true;
			}
			
			let p = object.position;
			// eased components for -1 < p < 1 (multiply the z)
			let q = (Math.abs(p)<1) ? (-0.5*(Math.cos(Math.PI*p))+0.5) : 1;		// angle
			let r = (Math.abs(p)<1) ? (Math.pow(p, 2)) : 1; 					// position
			let rotY = ( (p==0) ? 0 : ( (p>0) ? Math.PI/-4 : Math.PI/4 ) ) * q;
			let posX = p*SPACING + (p>0?1:-1)*Math.min(Math.abs(p),1)*2;
			let posZ = -1*(Math.abs(q*3)) * r;
			object.mesh.rotation.y = rotY;
			object.mesh.position.x = posX;
			object.mesh.position.z = posZ;
			
			object.reflectionMesh.rotation.y = rotY;
			object.reflectionMesh.position.x = posX;
			object.reflectionMesh.position.z = posZ;
			
			object.gradientMesh.rotation.y = rotY;
			object.gradientMesh.position.x = posX;
			object.gradientMesh.position.z = posZ + 0.001;
			
			object.position += this.position - this.lastPosition;
			//snap
			if (Number.isInteger(this.position)) object.position = Math.round(object.position);
			
			//move object position to right if it's too far to the left
			if (object.position <= -1 * NUM_ALBUMS_VISIBLE - 2) {
				object.position += TOTAL_GEOMETRIES;
			}
			//move to left if too far to the right
			else if (object.position >= NUM_ALBUMS_VISIBLE + 2) {
				object.position -= TOTAL_GEOMETRIES;
			}
		}
		
		let b = window.performance.now();
		
		if (b - st > 2) {
			console.log(`${a - st}, ${b - a}`);
		}
		
		
		//finally, set the lastPosition to the position at the end of this frame.
		this.lastPosition = this.position;
		this.lastFrameTime = Date.now();
	}
	_snap() {
		this.velocity = 0;
		if (Math.abs(Math.round(this.position) - this.position) != 0) {
			//console.log(Math.round(this.position) - this.position)
			console.log('snap');
		} 
		this._setPosition(Math.round(this.position));
	}
	_setPosition(pos) {
		//this.lastPosition = this.position;
		this.position = pos;
	}
	moveLeft() {
		
		if (this.target > -1*this.maxPosition+1) {
			this.target--;
			
			// if the key event is happening fast enough, give it a bigger kick (increment target 2x as much)
			let now = Date.now();
			if (now - this.lastLeftMove < FAST_MOVE_THRESHOLD && this.target > -1*this.maxPosition+2 && this.fastMoveEnabled) {
				this.target--;
			}
			this.lastLeftMove = now;
		}
	}
	moveRight() {
		
		if (this.target < 0) {
			this.target++;
			
			// if the key event is happening fast enough, give it a bigger kick (increment target 2x as much)
			let now = Date.now();
			if (now - this.lastRightMove < FAST_MOVE_THRESHOLD && this.target < 1 && this.fastMoveEnabled) {
				this.target++;
			}
			this.lastRightMove = now;
		}
		return;
		// Only move right if position < maximum
		if (Math.floor(-1*this.position) > 0-(1*this.velocity<-0.001)) {
			//Jump to *just* past the next position
			let diff = 1 - (this.position - Math.floor(this.position));
			//console.log(diff);
			if (diff > -0.5 && diff < 0.9 && this.velocity > -0.0001) {
				this._setPosition(this.position + diff + 0.001);
			}
			this.velocity = 0.05;
		}
	}
	cleanUp() {
		console.log(this);
		this.enabled = false;
		
		document.body.removeChild(renderer.domElement);
		scene = null;
		renderer = null;
		for (var object of this.objects) {
			//disposeHierarchy(object, disposeNode);
		}
		//disposeHierarchy(scene, disposeNode);
		this.albumArts = null;
	}
}

var controller = new Controller();

// const worldAxis = new THREE.AxesHelper(3);
// scene.add(worldAxis);


camera.position.z = 10;
camera.position.y = 0;
camera.lookAt(0,0,0);

const light = new THREE.PointLight( 0xffffff, 2, 14, 1.5 );
light.position.set( 0, 5, 3 );
scene.add( light );

const ambientLight = new THREE.AmbientLight( 0x484848 ); // soft white light
scene.add( ambientLight );


function animate() {
	if (renderer) {
		stats.begin();
		
		controller.animate();
		
		let st = window.performance.now();
		renderer.render( scene, camera );
		let end = window.performance.now();
		
		if (end - st > 17) {
			console.log(end - st);
		}
		
		stats.end();
		requestAnimationFrame( animate );
	}
}
animate();

document.body.addEventListener('keydown', handleKeypress);
window.addEventListener( 'resize', onWindowResize );

function handleKeypress(e) {
	if (e.key === 'ArrowLeft') {
		controller.moveRight();
	}
	else if (e.key === 'ArrowRight') {
		controller.moveLeft();
	}
}

function onWindowResize() {

	if (!resizeTicking) {
		setTimeout(() => {
			const aspect = window.innerWidth / window.innerHeight;
			camera.aspect = aspect;
			camera.updateProjectionMatrix();

			const dpr = renderer.getPixelRatio();
			//target.setSize( window.innerWidth * dpr, window.innerHeight * dpr );
			renderer.setSize( window.innerWidth, window.innerHeight );
			
			resizeTicking = false;
		}, 50);
		resizeTicking = true;
	}
}


function disposeNode (node)
{
    if (node instanceof THREE.Mesh)
    {
        if (node.geometry)
        {
            node.geometry.dispose ();
        }

        if (node.material)
        {
            if (node.material instanceof THREE.MeshFaceMaterial)
            {
                $.each (node.material.materials, function (idx, mtrl)
                {
                    if (mtrl.map)               mtrl.map.dispose ();
                    if (mtrl.lightMap)          mtrl.lightMap.dispose ();
                    if (mtrl.bumpMap)           mtrl.bumpMap.dispose ();
                    if (mtrl.normalMap)         mtrl.normalMap.dispose ();
                    if (mtrl.specularMap)       mtrl.specularMap.dispose ();
                    if (mtrl.envMap)            mtrl.envMap.dispose ();
                    if (mtrl.alphaMap)          mtrl.alphaMap.dispose();
                    if (mtrl.aoMap)             mtrl.aoMap.dispose();
                    if (mtrl.displacementMap)   mtrl.displacementMap.dispose();
                    if (mtrl.emissiveMap)       mtrl.emissiveMap.dispose();
                    if (mtrl.gradientMap)       mtrl.gradientMap.dispose();
                    if (mtrl.metalnessMap)      mtrl.metalnessMap.dispose();
                    if (mtrl.roughnessMap)      mtrl.roughnessMap.dispose();

                    mtrl.dispose ();    // disposes any programs associated with the material
                });
            }
            else
            {
                if (node.material.map)              node.material.map.dispose ();
                if (node.material.lightMap)         node.material.lightMap.dispose ();
                if (node.material.bumpMap)          node.material.bumpMap.dispose ();
                if (node.material.normalMap)        node.material.normalMap.dispose ();
                if (node.material.specularMap)      node.material.specularMap.dispose ();
                if (node.material.envMap)           node.material.envMap.dispose ();
                if (node.material.alphaMap)         node.material.alphaMap.dispose();
                if (node.material.aoMap)            node.material.aoMap.dispose();
                if (node.material.displacementMap)  node.material.displacementMap.dispose();
                if (node.material.emissiveMap)      node.material.emissiveMap.dispose();
                if (node.material.gradientMap)      node.material.gradientMap.dispose();
                if (node.material.metalnessMap)     node.material.metalnessMap.dispose();
                if (node.material.roughnessMap)     node.material.roughnessMap.dispose();

                node.material.dispose ();   // disposes any programs associated with the material
            }
        }
    }
}   // disposeNode

function disposeHierarchy (node, callback)
{
    for (var i = node.children.length - 1; i >= 0; i--)
    {
        var child = node.children[i];
        disposeHierarchy (child, callback);
        callback (child);
    }
}