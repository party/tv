function message(msg) {
  document.getElementById("message").innerHTML = msg;
}

var canvas = document.getElementById("canvas");
var field = new FluidField(canvas);
var display = new FluidDisplay(field);
var audio = null; // initialize only if on chrome
var detector = new BeatDetector();

var start = new Date(); // reset after each fps calculation
var initial = new Date(); // very beginning
var fpsFrames = 0; // for fps calculation

var time = 0; // time since very beginning
var offset = 0;
var interval = 5;
var running = false;

var n = 72000; // number of particles
var life = 100; // lifetime of particles in fpsFrames
var px = new Float32Array(n); // x coordinate of particles
var py = new Float32Array(n); // y coordinate of particles
var pc = new Float32Array(n); // color of particle (hue)
var pl = new Int16Array(n);   // age of particle

var showVelocity = false;
var showParticles = true;

var theta = 0;
var velocity = 2;
var radius = 8;
var fft_resolution = 256;

function resetParticle(i) {
    var t = i / n;
    var r = radius + Math.random();
    px[i] = field.width * 0.5 + r * Math.cos(t * 2 * Math.PI);
    py[i] = field.height * 0.5 + r * Math.sin(t * 2 * Math.PI);
    pc[i] = t + offset;
    pc[i] -= Math.floor(pc[i]);
    pl[i] = life;
}

function pulse(tmin, tmax) {
  for (var i = 0; i < n; i++) {
    if (Math.random() < 0.5 && pc[i] < tmax && pc[i] > tmin) {
      pl[i] = life - Math.floor(Math.random() * 15);
    }
  }
}

function updateFrame() {

  requestAnimationFrame(updateFrame);

  if (!audio.playing) return;

  var end = new Date;
  time = end - initial;
  offset = time * 0.0001;

  fpsFrames++;
  if (end - start > 500) {
    document.getElementById("fps").innerHTML = "FPS: " + ((1000 * (fpsFrames) / (end - start) + 0.5) | 0);
    start = end;
    fpsFrames = 0;
  }

  updateVelocities();
  field.update();

  for (var i = 0; i < n; i++) {
    var jitter = (1 - pl[i] / life);
    var vx = 10 * field.getXVelocity(px[i], py[i]);
    var vy = 10 * field.getYVelocity(px[i], py[i]);
    px[i] += vx + (Math.random() - 0.5) * jitter;
    py[i] += vy + (Math.random() - 0.5) * jitter;
    pl[i]--;
    if (pl[i] < 1 || px[i] < 1 || px[i] > field.width || py[i] < 1 || py[i] > field.height - 1) {
      resetParticle(i);
    }
  }

  display.clear();

  if (showParticles)
    display.renderParticles(field, px, py, pc, pl);

  if (showVelocity)
    display.renderVelocityField(field);

}

function updateVelocities() {

  detector.sample(audio.analyser);

  // big beats
  if (detector.beatChance > 1.6) {
    radius = 15;
  } else {
    radius = 8;
  }

  // jets for bins that are above threshold
  for (var i = 0; i < detector.historyBins; i++) {
    var fraction = i / detector.historyBins;
    fraction += offset;
    fraction -= Math.floor(fraction);
    var theta = fraction * Math.PI * 2;
    var x = Math.floor(field.width / 2 + radius * Math.cos(theta));
    var y = Math.floor(field.height / 2 + radius * Math.sin(theta));
    if (detector.binChance[i] > 1.5) {
      var v = detector.binChance[i];
      if (v > 3) v = 3;
      var vx = field.getXVelocity(x, y) + v * Math.cos(theta);
      var vy = field.getYVelocity(x, y) + v * Math.sin(theta);
      field.setVelocity(x, y, vx, vy);
      if (3 < detector.binChance[i] && detector.binChance[i] < 50) {
        var tmin = i / detector.historyBins - 0.01;
        var tmax = tmin + 0.02;
        pulse(tmin, tmax);
      }
    }
  }

}

window.onload = function() {
  canvas.addEventListener('click', function(){
    showParticles =! showParticles;
    showVelocity =! showVelocity;
  });

  audio = new Audio();

  if (location.search === '?autoplay') {
    loadSample.onclick();
  }

  document.addEventListener('drop', function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    if (audio.source) audio.source.disconnect(); // clean up previous mp3
    message("Loading User Audio...");
    var droppedFiles = evt.dataTransfer.files;
    var reader = new FileReader();
    reader.onload = function(fileEvent) {
      var data = fileEvent.target.result;
      audio.initAudio(data);
    };
    reader.readAsArrayBuffer(droppedFiles[0]);
  }, false);

  document.addEventListener('dragover', function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    return false;
  }, false);

  for (var i = 0; i < n; i++) {
    resetParticle(i);
    pl[i] = Math.floor(Math.random() * life);
  }

  requestAnimationFrame(updateFrame);
};