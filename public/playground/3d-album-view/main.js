$(() => {
	
//stats module
if (Stats) {
	var stats = new Stats();
	// 0: fps, 1: ms, 2: mb, 3+: custom
	stats.showPanel( 1 );
	document.body.appendChild( stats.dom );
}
else var stats = {begin: ()=>{}, end: () => {}, update: () => {}}

class AlbumArtController{
	constructor() {
		this.arts = [];
		this.paths = [];
		this.noImage = loader.load('images/no-image.png');
		this.gradient = loader.load('images/gradient2.png');
		for (var i = 1; i <= 100; i++) {
			this.paths.push(`images/${i}.jpg`);
		}
	}
	create
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
	cleanUp() {
		for (let i in this.arts) {
			let art = this.arts[i];
			if (art && typeof art.dispose === 'function') {
				art.dispose();
			}
			art = null;
		}
		this.arts = null;
		this.paths = null;
	}
}


class Controller{
	constructor() {
		this.objects = [];
		this.position = 0;
		this.lastPosition = 0;
		this.lastFrameTime = 0;
		this.target = 0;
		this._lastLeftMove = 0;
		this._lastRightMove = 0;
		this._lastRaycast = 0;
		this.enabled = true;
		this._mousedOverObject = null;
		
		this.fastMoveEnabled = true;
		
		this.albumArts = new AlbumArtController();
		//this.DOMControls = this._createDOMControls();
		
		const noImage = this.albumArts.noImage;
		
		this.maxPosition = 100;
		
		this.geometry = new THREE.PlaneBufferGeometry(PICTURE_SIZE, PICTURE_SIZE, 1, 1);
		const gradientMaterial = new THREE.MeshPhongMaterial({
			map: this.albumArts.gradient, 
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
			//reflectionMesh.rotation.z = -1 * Math.PI;
			reflectionMesh.scale.y = -1;
			//Gradient (for reflection)
			let gradientMesh = new THREE.Mesh(this.geometry, gradientMaterial);
			gradientMesh.position.y = -1 * PICTURE_SIZE;
			
			let order = 'XYZ';
			mesh.rotation.reorder(order);
			reflectionMesh.rotation.reorder(order);
			gradientMesh.rotation.reorder(order);
			
			let pos = i - NUM_ALBUMS_VISIBLE - 1;
			this.objects[i] = {
				mesh: mesh,
				reflectionMesh: reflectionMesh,
				gradientMesh: gradientMesh,
				position: pos,
				isMousedOver: false,
			}
			scene.add(mesh);
			scene.add(reflectionMesh);
			scene.add(gradientMesh);
		}
	}
	/**
	 * Animates the scene.
	 * @returns {boolean} Whether a frame was rendered.
	 */
	animate() {
		if (!this.enabled) return false;
		
		const startTime = Date.now();
		
		let diff = this.target - this.position;
		
		if (diff === 0 && startTime - this.lastFrameTime < MIN_FRAME_TIME) return false;
		
		//manage velocity
		
		let velocity = 0;
		// Move to target, faster when target is farther away
		if (Math.abs(diff) > 0.001) {
			velocity = SCROLL_SPEED * (diff);
		}
		//if we are super close, just snap
		else{
			this._snap();
		}
		
		this._setPosition(this.position + velocity);
		
		//Update each object
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
			let showoffRot = (1 - q) * -0.25;									// x rotation for center album
			let showoffDiff = PICTURE_SIZE * Math.sin(showoffRot);
			let rotZ = showoffRot * rotY * 0.5; 								// to correct for double rotation
			
			//temp
			object.q = q; object.r = r;
			
			object.mesh.rotation.y = rotY;
			object.mesh.rotation.x = showoffRot;
			object.mesh.rotation.z = -1 * rotZ;
			object.mesh.position.x = posX;
			object.mesh.position.z = posZ;
			
			object.reflectionMesh.rotation.y = rotY;
			object.reflectionMesh.rotation.z = rotZ;
			object.reflectionMesh.position.x = posX;
			object.reflectionMesh.position.z = posZ - showoffDiff/2;
			object.reflectionMesh.position.y = -1*PICTURE_SIZE - showoffDiff/2 * 0.13 * (1 - q);
			
			object.gradientMesh.rotation.y = rotY;
			object.gradientMesh.rotation.z = rotZ;
			object.gradientMesh.position.x = posX;
			object.gradientMesh.position.z = posZ - showoffDiff/2 + 0.001;
			object.gradientMesh.position.y = -1*PICTURE_SIZE - showoffDiff/2 * 0.13 * (1 - q);
			
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
		
		const endTime = Date.now();
		
		//finally, set the lastPosition to the position at the end of this frame.
		this.lastPosition = this.position;
		this.lastFrameTime = endTime;
		
		return true;
	}
	_snap() {
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
	_updateRaycast() {
		
		//Handle raycaster intersects
		raycaster.setFromCamera( mouse, camera );
		
		const intersects = raycaster.intersectObjects(scene.children);
		
		if (intersects.length == 0) this._mousedOverObject = null;
		else {
			//find the closest intersect
			let closestDistance = 1000;
			let closestObject = null;
			for (let i = 0; i < intersects.length; i++) {
				let intersect = intersects[i];
				if (intersect.distance < closestDistance) {
					closestDistance = intersect.distance;
					closestObject = intersect.object;
				}
			}
			//find which object it is
			for (var object of this.objects) {
				if (object.mesh === closestObject && object.mesh.visible) {
					object.isMousedOver = true;
					this._mousedOverObject = object;
				}
				else {
					object.isMousedOver = false;
				}
			}
		}
	}
	_createDOMControls() {
		let barContainer = document.createElement('div');
		let barParent = document.createElement('div');
		let bar = document.createElement('div');
		let barDrag = document.createElement('div');
		let arrowLeft = document.createElement('div');
		let arrowRight = document.createElement('div');
		
		barContainer.classList.add('threeDView-seekBarContainer');
		barParent.classList.add('threeDView-seekBarParent');
		bar.classList.add('threeDView-seekBar');
		barDrag.classList.add('threeDView-seekBar-drag');
		arrowLeft.classList.add('threeDView-seekBar-arrowLeft');
		arrowRight.classList.add('threeDView-seekBar-arrowRight');
		
		barContainer.appendChild(barParent);
		barParent.appendChild(arrowLeft);
		barParent.appendChild(arrowRight);
		barParent.appendChild(bar);
		bar.appendChild(barDrag);
		
		document.body.appendChild(barContainer);
		
		return {
			barContainer: barContainer,
			barParent: barParent,
			bar: bar,
			barDrag: barDrag,
			arrowLeft: arrowLeft,
			arrowRight: arrowRight,
		}
	}
	moveLeft() {
		
		if (this.target > -1*this.maxPosition+1) {
			this.target--;
			
			// if the key event is happening fast enough, give it a bigger kick (increment target 2x as much)
			let now = Date.now();
			if (now - this._lastLeftMove < FAST_MOVE_THRESHOLD && this.target > -1*this.maxPosition+2 && this.fastMoveEnabled) {
				this.target--;
			}
			this._lastLeftMove = now;
		}
	}
	moveRight() {
		
		if (this.target < 0) {
			this.target++;
			
			// if the key event is happening fast enough, give it a bigger kick (increment target 2x as much)
			let now = Date.now();
			if (now - this._lastRightMove < FAST_MOVE_THRESHOLD && this.target < 1 && this.fastMoveEnabled) {
				this.target++;
			}
			this._lastRightMove = now;
		}
	}
	onMouseDown(e) {
		if (e.which === 1) {
			this._updateRaycast();
			//Set the target to the clicked object
			if (this._mousedOverObject && this._mousedOverObject.mesh.visible) {
				this.target = Math.round(this.position - this._mousedOverObject.position);
			}
		}
	}
	cleanUp() {
		console.log(this);
		
		for (var object of this.objects) {
			scene.remove(object.gradientMesh);
			scene.remove(object.mesh);
			scene.remove(object.reflectionMesh);
			disposeNode(object.gradientMesh);
			disposeNode(object.mesh);
			disposeNode(object.reflectionMesh);
		}
		
		this.albumArts.cleanUp();
		
		scene.remove(light);
		light.dispose();
		scene.remove(ambientLight);
		ambientLight.dispose();
		
		this.enabled = false;
		
		document.body.removeChild(renderer.domElement);
		scene = null;
		renderer = null;
		camera = null;
		this.albumArts = null;
	}
}

stats.begin();

window.scene = new THREE.Scene();
window.loader = new THREE.TextureLoader();
window.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );

window.mouse = new THREE.Vector2();
window.raycaster = new THREE.Raycaster();


window.renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const NUM_ALBUMS_VISIBLE = 8;
const PICTURE_SIZE = 6;
const TOTAL_GEOMETRIES = 3 + (NUM_ALBUMS_VISIBLE * 2);
var   SCROLL_SPEED = 0.175;
const RAYCAST_UPDATE_TIME = 150;						// Raycasting is non-trivial, so we shouldn't do it on every frame.
const FAST_MOVE_THRESHOLD = 50;
const MIN_FRAME_TIME = 150;
var SPACING = 1.5;

var resizeTicking = false;


window.controller = new Controller();

// const controls = new OrbitControls( camera, renderer.domElement );

camera.position.y = 3.8;
camera.position.z = 9.5;
camera.lookAt(0,0,0);

const light = new THREE.PointLight( 0xffffff, 2, 14, 1.5 );
light.position.set( 0, 5, 3 );
scene.add( light );

const ambientLight = new THREE.AmbientLight( 0x484848 ); // soft white light
scene.add( ambientLight );

animate();

window.addEventListener('keydown', handleKeypress);
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('resize', onWindowResize );
renderer.domElement.addEventListener('mousedown', (e) => {controller.onMouseDown(e);});

stats.update();

function animate() {
	if (renderer) {
		stats.begin();
		// stats.update();
		
		let didRender = controller.animate();
		
		let st = window.performance.now();
		if (didRender||true) renderer.render( scene, camera );
		let end = window.performance.now();
		
		if (end - st > 17) {
			console.log(end - st);
		}
		
		if (window.controls) controls.update();
		
		stats.end();
		requestAnimationFrame( animate );
	}
}

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


function onMouseMove( e ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
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
}

});