/**
*
* Loop Waveform Visualizer by Felix Turner
* www.airtight.cc
*
* Audio Reactive Waveform via Web Audio API.
*
*/


var mouseX = 0, mouseY = 0, windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2, camera, scene, renderer, material, container;
var buffer;
var audioBuffer;
var dropArea;
var analyser;

var CameraLetterWasPressedSinceLastRender = false;

$(document).ready(function() {

    //Chrome is only browser to currently support Web Audio API
    var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    var is_webgl = ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )();

    if(!is_chrome){
        $('#loading').html("This demo requires <a href='https://www.google.com/chrome'>Google Chrome</a>.");
    } else if(!is_webgl){
        $('#loading').html('Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">WebGL</a>.<br />' +
        'Find out how to get it <a href="http://get.webgl.org/">here</a>, or try restarting your browser.');
    }else {
        $('#loading').html('<a id="loadSample">Load</a>');
        init();
    }

});

function init() {

    //init 3D scene
    container = document.createElement('div');
    document.body.appendChild(container);
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000000);
    camera.position.z = 2000;
    scene = new THREE.Scene();
    scene.add(camera);
    renderer = new THREE.WebGLRenderer({
        antialias : false,
        sortObjects : false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    // stop the user getting a text cursor
    document.onselectStart = function() {
        return false;
    };

    //add stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);

    $(document).mousemove(onDocumentMouseMove);
    $(window).resize(onWindowResize);

    onWindowResize(null);

    analyser = window.parent.analyser1;

    startViz();
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX)*2;
    mouseY = (event.clientY - windowHalfY)*2;
}

function onWindowResize(event) {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

var mouseMovementXScale = 1;
var mouseMovementXDirection = 0.005;

var mouseMovementYScale = 1;
var mouseMovementYDirection = 0.001;

var mouseMovement = false;

$(window.parent.document.body).find('.cover').click(function(){
    mouseMovement = !mouseMovement;
});

function render() {
    LoopVisualizer.update();

    if (mouseMovement) {
        mouseX = windowHalfX * mouseMovementXScale;
        mouseY = windowHalfY * mouseMovementYScale;

        mouseMovementYScale += mouseMovementYDirection;
        if (mouseMovementYScale > 1.4) {
            mouseMovementYDirection = -1 * mouseMovementYDirection;
        }
        if (mouseMovementYScale < 0.6) {
            mouseMovementYDirection = -1 * mouseMovementYDirection;
        }

        mouseMovementXScale += mouseMovementXDirection;
        if (mouseMovementXScale > 2) {
            mouseMovementXDirection = -1 * mouseMovementXDirection;
        }
        if (mouseMovementXScale < 0) {
            mouseMovementXDirection = -1 * mouseMovementXDirection;
        }
    } else {
        mouseX = windowHalfX;
        mouseY = windowHalfY * 1.28;
    }

    var xrot = mouseX/window.innerWidth * Math.PI*2 + Math.PI;
    var yrot = mouseY/window.innerHeight* Math.PI*2 + Math.PI;

    LoopVisualizer.loopHolder.rotation.x += (-yrot - LoopVisualizer.loopHolder.rotation.x) * 0.3;
    LoopVisualizer.loopHolder.rotation.y += (xrot - LoopVisualizer.loopHolder.rotation.y) * 0.3;

    renderer.render(scene, camera);
}

$(window).mousewheel(function(event, delta) {
    //set camera Z
    camera.position.z -= delta * 50;
});

function startViz(){
    LoopVisualizer.init();
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    render();
    stats.update();
}