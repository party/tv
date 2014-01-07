//Pareidolia (c) by @felixturner / www.airtight.cc
//using three.js v55
//audio reactive cubes
//light intensity linked to audio level
//postprocessing via mirror , dotscreen shader + rgb shift shaders

if(!Detector.webgl)
	Detector.addGetWebGLMessage();

var BOX_COUNT = 100;
var BEAM_ROT_SPEED = 0.003;
var TILT_SPEED = 0.1;
var TILT_AMOUNT = 0.5;
var BEAT_HOLD_TIME = 60; //num of frames to hold a beat
var BEAT_DECAY_RATE = 0.97;
var BEAT_MIN = 0.6; //level less than this is no beat

var container, stats;
var camera, scene, renderer;

var imgTextureStars, imgTextureStripes, imgTextureStripes;

var composer;
var rgbPass;
var colorifyPass;

var mouseX = 0, mouseY = 0;
var windowHalfX, windowHalfY;

var boxes = [];
var cubeHolder;
var backMesh;
var backMesh2;
var light1;
var light2;
var timeCount = 0;

var beatCutOff = 20;
var beatTime = 30; //avoid auto beat at start

var doStrobe = false;
var doShake = false;
var strobeOn = false;

var infoPanel;
var tagPanel;
var tagButton;

init();

function init() {

	//DOCUMENT
	container = document.createElement('div');
	document.body.appendChild(container);
	document.onselectstart = function() {
		return false;
	};
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	document.addEventListener('mousedown', onDocumentMouseDown, false);
	document.addEventListener('mouseup', onDocumentMouseUp, false);
	document.addEventListener('drop', onDocumentDrop, false);
	document.addEventListener('dragover', onDocumentDragOver, false);
	window.addEventListener('resize', onResize, false);

	tagPanel = document.querySelector('#tag');
	tagButton = document.querySelector('#tagButton');
	tagButton.addEventListener('mousedown', clickTag, false);

	//DAT.GUI
	sketchParams = {
		volSens: 1.0,
		cubeSpeed: 2.0
	};
	gui = new dat.GUI({ autoPlace: false });
	var customContainer = document.getElementById('my-gui-container');
	document.querySelector('#gui').appendChild(gui.domElement);
	gui.add(sketchParams, 'volSens', 0.1, 10).listen().step(0.1);
	gui.add(sketchParams, 'cubeSpeed', -2, 4).step(0.1);

	//STATS
	stats = new Stats();
	document.querySelector('#fps').appendChild(stats.domElement);

	//RENDERER
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColorHex ( 0x000000 );
	container.appendChild(renderer.domElement);

	//3D SCENE
	camera = new THREE.PerspectiveCamera(55,window.innerWidth/ window.innerHeight, 1, 3000);
	camera.position.z = 1200;
	scene = new THREE.Scene();
	scene.add(camera);

	//BKGND PLANE
	imgTextureStars = THREE.ImageUtils.loadTexture( "img/stars.jpg" );
	backMaterial = new THREE.MeshBasicMaterial( {
		map:imgTextureStars
	} );

	backMesh = new THREE.Mesh( new THREE.SphereGeometry( 2000, 30, 20 ), backMaterial  );
	backMesh.scale.x = -1;
	scene.add( backMesh );

	imgTextureStripes2 = THREE.ImageUtils.loadTexture( "img/stripes2.jpg" );
	imgTextureStripes2.wrapS = imgTextureStripes2.wrapT = THREE.RepeatWrapping;
	imgTextureStripes2.repeat.set( 10, 10 );
	backMaterial2 = new THREE.MeshBasicMaterial( {
		map:imgTextureStripes2
	} );

	backMesh2 = new THREE.Mesh( new THREE.SphereGeometry( 1900, 30, 20 ), backMaterial2  );
	backMesh2.scale.x = -1;
	scene.add( backMesh2 );
	backMesh2.visible = false;

	//LIGHTS
	//orig light
	light1 = new THREE.PointLight( 0xFFFFFF, 3, 200 );
	scene.add( light1 );

	//front light
	light2 = new THREE.PointLight( 0xFFFFFF, 1, 1000 );
	scene.add( light2 );
	light2.position.z = 1000;

	//SUN BEAMS
	BEAM_COUNT = 6;
	var i;
	var beamGeometry = new THREE.PlaneGeometry(5000, 50, 1, 1);
	beamGroup = new THREE.Object3D();
	beamMaterial = new THREE.MeshBasicMaterial({
		opacity: 0.3,
		transparent: true
	});

	for (i = 0; i < BEAM_COUNT; ++i) {
		beam = new THREE.Mesh(beamGeometry, beamMaterial);
		beam.doubleSided = true;
		beam.rotation.x = Math.random() * Math.PI;
		beam.rotation.y = Math.random() * Math.PI;
		beam.rotation.z = Math.random() * Math.PI;
		beamGroup.add(beam);
	}
	scene.add(beamGroup);

	//CUBES
	var cubesize = 100;
	var geometry = new THREE.CubeGeometry(cubesize, cubesize, cubesize);
	cubeHolder = new THREE.Object3D();
	imgTextureStripes = THREE.ImageUtils.loadTexture( "img/stripes.jpg" );
	cubeMaterial  = new THREE.MeshPhongMaterial( {
		ambient: 0x111111,
		color: 0x666666,
		specular: 0x999999,
		shininess: 30,
		shading: THREE.FlatShading ,
		map:imgTextureStripes
	});
	for(i = 0; i < BOX_COUNT; i++) {
		var box = new Box();
		boxes.push(box);
		var cube = new THREE.Mesh(geometry,cubeMaterial );
		cube.position = box.posn;
		cube.rotation = box.rotation;
		cube.ox = cube.scale.x = Math.random() * 1 + 1;
		cube.oy = cube.scale.y = Math.random() * 1 + 1;
		cube.oz = cube.scale.z = Math.random() * 1 + 1;
		cubeHolder.add(cube);
	}
	scene.add(cubeHolder);

	//POST PROCESSING
	composer = new THREE.EffectComposer( renderer);
	//Create Shader Passes
	var renderPass = new THREE.RenderPass( scene, camera );
	var dotScreenPass = new THREE.DotScreenPass( new THREE.Vector2( 0, 0 ), 0.5, 0.8 );
	rgbPass = new THREE.ShaderPass( THREE.RGBShiftShader );
	rgbPass.uniforms[ "amount" ].value = 0.005;
	var mirrorPass = new THREE.ShaderPass( THREE.MirrorShader );
	var hblurPass = new THREE.ShaderPass( THREE.HorizontalBlurShader );
	hblurPass.uniforms[ 'h' ].value =  1.0 / (512.0*2) ;
	//Add Shader Passes to Composer
	composer.addPass( renderPass );
	composer.addPass( hblurPass );
	composer.addPass( dotScreenPass );
	composer.addPass( mirrorPass );
	composer.addPass( rgbPass );
	rgbPass.renderToScreen = true;

	audioContext = new window.webkitAudioContext();

	onResize();

	lastTime = performance.now();
	animate();

	selectOptionMic();
}

function animate() {
	requestAnimationFrame(animate);
	render();
	stats.update();
	lastTime = time;
}

function render() {

	time = performance.now();
	delta = ( time - lastTime );

	if (!isPlayingAudio) return;

	timeCount ++;

	beamGroup.rotation.x += BEAM_ROT_SPEED;
	beamGroup.rotation.y += BEAM_ROT_SPEED;

	rgbPass.uniforms[ "angle" ].value = Math.sin(timeCount/100)*Math.PI;
	rgbPass.uniforms[ "amount" ].value = normLevel*0.01	;

	updateAudio();

	for(var i = 0; i < BOX_COUNT; i++) {
		boxes[i].update();
	}

	light1.intensity = normLevel * 400;
	light1.distance = normLevel * 1000;

	beamMaterial.opacity = Math.min(normLevel *0.4,0.6);

	if (doShake){
		var maxshake = 60;
		var shake = normLevel * maxshake ;
		camera.position.x = Math.random()*shake - shake/2;
		camera.position.y = Math.random()*shake - shake/2;
	}

	camera.rotation.z += 0.003;

	if (doStrobe){
		strobeOn = !strobeOn;
		if (strobeOn){
			light2.intensity = 2;
		}else{
			light2.intensity = 0.5;
		}
	}else{
		light2.intensity = 0.2;
	}

	//flash background  on level threshold
	if (normLevel > 0.5 ){
		renderer.setClearColorHex ( 0xFFFFFF );
		backMesh.visible = true;
	}else{
		renderer.setClearColorHex ( 0x000000 );
		backMesh.visible = false;
	}

	//show stripes for 6 frames on beat
	backMesh2.visible = beatTime < 6;

	composer.render( 0.1);
}

function updateAudio(){

	if (!isPlayingAudio)return;
	analyser.getByteFrequencyData(freqByteData);

	var length = freqByteData.length;

	//GET AVG LEVEL
	var sum = 0;
	for(var j = 0; j < length; ++j) {
		sum += freqByteData[j];
	}

	// Calculate the average frequency of the samples in the bin
	var aveLevel = sum / length;

	normLevel = (aveLevel / 256) * sketchParams.volSens; //256 is the highest a freq data can be

	//BEAT DETECTION
	if (normLevel  > beatCutOff && normLevel > BEAT_MIN){
		beatCutOff = normLevel *1.1;
		beatTime = 0;
	}else{
		if (beatTime < BEAT_HOLD_TIME){
			beatTime ++;
		}else{
			beatCutOff *= BEAT_DECAY_RATE;
		}
	}
}

function doEffect(){

	if (!isPlayingAudio) return;

	if (mouseDown) return;

	mouseDown = true;

	var r = Math.random();
	if (r <0.5){
		doStrobe=true;
	}else {
		doShake=true;
	}
}

function stopEffect(){
	mouseDown = false;
	doStrobe=false;
	doShake=false;
}

function onDocumentMouseDown(event) {
	doEffect();
}

function onDocumentMouseUp(event) {
	stopEffect();
}

function onDocumentMouseMove(event) {
	mouseX = (event.clientX - windowHalfX) / (windowHalfX);
	mouseY = (event.clientY - windowHalfY) / (windowHalfY);
}

function selectOptionMic(){
	//get mic in
	getMicInput();
	sketchParams.volSens = 4;
}

function selectOptionSample(){
	introPanel.style.display = 'none';
	//load MP3
	loadSampleAudio();
	sketchParams.volSens = 1.5;
}

function clickTag(){
	//show info panel
	if (infoPanel.style.display == 'inline'){
		infoPanel.style.display = 'none';
		tagButton.innerHTML = 'Pareidolia +';
	}else{
		infoPanel.style.display = 'inline';
		tagButton.innerHTML = 'Pareidolia -';
	}
}

function showTag(){
	tagPanel.style.display = 'inline';
}

function onResize() {

	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;

	camera.updateProjectionMatrix();
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
}

