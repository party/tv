function BeatDetector() {
  this.history = [];
  this.historyBins = 12;
  this.beatChance = 0;
  this.binChance = [];
  this.historyWindow = 30;
  this.levelHistory = [];
  this.threshold = 2; // times stdev
  for (var i = 0; i < this.historyBins; i++) {
    this.history[i] = [];
    this.beatChance[i] = 0;
  }
}

BeatDetector.prototype.sample = function(analyser) {
  var smoothingTimeConstantTest;
  try {
    smoothingTimeConstantTest = analyser.smoothingTimeConstant;
  } catch (err) {}
  if (!smoothingTimeConstantTest) {
    return;
  }

  var i, j;
  var sum, cur, mean, variance, stdev, weight;
  var fftSize = analyser.frequencyBinCount;
  var freqByteData = new Uint8Array(fftSize);

  analyser.smoothingTimeConstant = 0.1;
  analyser.getByteFrequencyData(freqByteData);
  // get average level
  sum = 0;
  for (i = 0; i < fftSize; i++) {
    weight = 2 - (i / fftSize);
    sum += weight * freqByteData[i];
  }
  var average = sum / fftSize / 255;
  this.levelHistory.push(average);
  if (this.levelHistory.length > this.historyWindow) {
    this.levelHistory.shift();
  }
  // add bins to history
  var binsPerBin = Math.floor(fftSize / this.historyBins);
  for (i = 0; i < this.historyBins; i++) {
    sum = 0;
    for (j = 0; j < binsPerBin; j++) {
      sum += freqByteData[i * binsPerBin + j] / 255;
    }
    this.history[i].push(sum / binsPerBin);
    if (this.history[i].length > this.historyWindow) {
      this.history[i].shift();
    }
  }
  // check if newest entry in history is significant
  if (this.levelHistory.length >= this.historyWindow) {

    // first look at general levels
    cur = this.levelHistory[this.historyWindow - 1];
    mean = 0;
    for (i = 0; i < this.historyWindow - 1; i++) {
      mean += this.levelHistory[i];
    }
    mean /= this.levelHistory.length;
    variance = 0;
    for (i = 0; i < this.historyWindow - 1; i++) {
      variance += (this.levelHistory[i] - mean) * (this.levelHistory[i] - mean);
    }
    stdev = Math.sqrt(variance / this.historyWindow);
    this.beatChance = Math.abs(cur - mean) / (stdev + 0.01);

    // then look at each bin
    for (i = 0; i < this.historyBins; i++) {
      cur = this.history[i][this.historyWindow - 1];
      mean = 0;
      for (j = 0; j < this.historyWindow - 1; j++) {
        mean += this.history[i][j];
      }
      mean /= this.history[i].length;
      variance = 0; // sample variance
      for (j = 0; j < this.historyWindow - 1; j++) {
        variance += (this.history[i][j] - mean) * (this.history[i][j] - mean);
      }
      variance /= this.historyWindow;
      stdev = Math.sqrt(variance);
      weight = 2 - (i / this.historyBins);
      this.binChance[i] = Math.abs(cur - mean) / (stdev + 0.01);
    }
    // console.log(this.beatChance);
  }
};

(function(){
  var detector = new BeatDetector();

  function updateFrame() {
    requestAnimationFrame(updateFrame);
    updateVelocities();
  }

  function updateVelocities() {
    detector.sample(window.parent.analyser1);

    var beatSize;

    if (detector.beatChance > 1.6) {
      beatSize = 'large';
    } else {
      beatSize = 'small';
    }

    var hasTrigger = false;

    for (var i = 0; i < detector.historyBins; i++) {
      if (detector.binChance[i] > 1.5) {
        if (3 < detector.binChance[i] && detector.binChance[i] < 50) {
          $('body').trigger({
            type: 'beat',
            beatSize: beatSize
          });
          break;
        }
      }
    }
  }

  window.startBeatDetection = function() {
    requestAnimationFrame(updateFrame);
  };
})();