var mouseX = 0, mouseY = 0, mouseXBuffer = 0, mouseYBuffer = 0, windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2, camera, scene, renderer, material, container, canvas, ctx;
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

    //init canvas
    container = document.createElement('div');
    document.body.appendChild(container);

    canvas = document.createElement('canvas');
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    ctx = canvas.getContext('2d');

    container.appendChild(canvas);

    //add stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);

    analyser = window.parent.analyser1;

    start();
}

$(window.parent.document.body).find('.cover').click(function(){
    // Outer frame clicked
});

var diamondImage = new Image()
diamondImage.src = 'data:image/svg+xml;utf8,<svg width="200" height="200" fill="#fff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve"><path d="M80.2,18.6c-0.7-0.7-1.6-1.1-2.7-1.1h-55c-1,0-1.9,0.4-2.7,1.1L6.1,32.3c-1.4,1.4-1.5,3.7-0.1,5.2l41.3,43.8  c0.7,0.7,1.7,1.2,2.7,1.2s2-0.4,2.7-1.2L94,37.6c1.4-1.5,1.4-3.8-0.1-5.2L80.2,18.6z M88.2,33.8H66.8L77.5,23L88.2,33.8z M74.5,22.5  L63.8,33.2L53,22.5H74.5z M60.7,33.8H39.3L50,23L60.7,33.8z M47,22.5L36.3,33.2L25.5,22.5H47z M22.5,23l10.7,10.7H11.8L22.5,23z   M11.6,36.3h23.7l11.8,37.7L11.6,36.3z M50,74.6L38,36.3H62L50,74.6z M52.8,73.9l11.8-37.7h23.7L52.8,73.9z"></path></svg>';

var diamondSize = 70;
var numberOfDiamonds = 13;

var diamonds;
var diamondSpacing;

var diamondRowLevels;
var numberOfDiamondRows;

function initializeDiamondRowsAndSpacing() {
    diamonds = [];
    diamondRowLevels = [];

    diamondSpacing = canvas.width / numberOfDiamonds;
    for (var i = 0; i < numberOfDiamonds; i++) {
        diamonds.push([diamondSpacing * (i + .5), 0]);
    }

    numberOfDiamondRows = Math.ceil(canvas.height / diamondSpacing) + 1;
    for (var i = 0; i < numberOfDiamondRows; i++) {
        diamondRowLevels.push(1);
    }
}

$(window).resize(function(){
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    ctx = canvas.getContext('2d');

    initializeDiamondRowsAndSpacing();
});

var freqByteData;
var timeByteData;

function start(){
    initializeDiamondRowsAndSpacing();

    if (analyser && analyser.frequencyBinCount) {
        freqByteData = new Uint8Array(analyser.frequencyBinCount);
        timeByteData = new Uint8Array(analyser.frequencyBinCount);
    }

    nextAnimationFrame();
}

var VOL_SENS = 5;

function drawImageCentered(img, x, y, height, width) {
    var cX = x - (width / 2);
    var cY = y - (height / 2);
    ctx.drawImage(img, cX, cY, height, width);
}

function render() {
    if (!freqByteData) {
        if (analyser && analyser.frequencyBinCount) {
            freqByteData = new Uint8Array(analyser.frequencyBinCount);
            timeByteData = new Uint8Array(analyser.frequencyBinCount);
        }

        if (!freqByteData) {
            return;
        }
    }

    analyser = window.parent.analyser1;

    analyser.smoothingTimeConstant = 0.1;
    analyser.getByteFrequencyData(freqByteData);
    analyser.getByteTimeDomainData(timeByteData);

    //get average level
    var length = freqByteData.length;
    var sum = 0;
    for(var j = 0; j < length; ++j) {
        sum += freqByteData[j];
    }
    var aveLevel = sum / length;
    var scaled_average = (aveLevel / 256) * VOL_SENS; //256 the highest a level can be?

    // TODO
    scaled_average = scaled_average * 2;

    diamondRowLevels.push(scaled_average);
    diamondRowLevels.shift(1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var canvasHeight = canvas.height;

    var x, y, adjustedSize, offsetSize;

    for (var i = 0; i < diamonds.length; i++) {
        for (var j = 0; j < numberOfDiamondRows; j++) {
            adjustedSize = diamondSize * diamondRowLevels[j];

            if (i % 2 !== 0) {
                adjustedSize = diamondSize * diamondRowLevels[j] * .5;
            }

            x = diamonds[i][0];
            y = (diamonds[i][1] + (diamondSpacing * j));

            drawImageCentered(diamondImage, x, y, adjustedSize, adjustedSize);
        }

        if (i % 2 === 0) {
            diamonds[i][1] += 1;
        } else {
            diamonds[i][1] += .5;
        }

        diamonds[i][1] = diamonds[i][1] % diamondSpacing;
    }
}

function nextAnimationFrame() {
    requestAnimationFrame(nextAnimationFrame);
    render();
    stats.update();
}
