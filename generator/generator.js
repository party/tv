(function() {
  var HEIGHT, OFF, ON, WIDTH, adjustWidth, ballDirectionX, ballDirectionY, ballOn, ballPositionX, ballPositionY, ballReplace, colorOpacity, drain, drainTimes, draw, drawBall, drawLog, drawPre, drawScanLinePositionX, drawScanLines, emptyPre, frames, hills, hillsOn, inverted, lastHTML, line, lineDirection, lineOn, linePosition, lineReplace, nextLine, random, randomOn, scanLinesOn, stream;
  window.log = function() {
    if (this.console && this.console.log) {
      return console.log.apply(console, Array.prototype.slice.call(arguments));
    }
  };
  String.prototype.replaceAt = function(index, character) {
    return this.substr(0, index) + character + this.substr(index + character.length);
  };
  stream = [];
  lineOn = hillsOn = randomOn = scanLinesOn = ballOn = drawLog = drawPre = false;
  OFF = '─';
  ON = '█';
  WIDTH = 100;
  HEIGHT = 100;
  lineOn = true;
  hillsOn = true;
  randomOn = true;
  scanLinesOn = true;
  ballOn = true;
  drawLog = true;
  drawPre = true;
  nextLine = function() {
    return stream.shift();
  };
  hills = function() {
    var output, split, width, _results;
    if (!hillsOn) {
      return;
    }
    width = Math.floor(WIDTH * 1.25);
    _results = [];
    for (split = 1; 1 <= width ? split <= width : split >= width; 1 <= width ? split++ : split--) {
      output = (new Array(split).join(ON)) + (new Array(width - split).join(OFF));
      output = line(output);
      _results.push(stream.push(output));
    }
    return _results;
  };
  random = function() {
    var i, output;
    if (!randomOn) {
      return;
    }
    output = '';
    for (i = 1; 1 <= WIDTH ? i <= WIDTH : i >= WIDTH; 1 <= WIDTH ? i++ : i--) {
      output += Math.random() < .5 ? ON : OFF;
    }
    output = line(output);
    return stream.push(output);
  };
  drawScanLinePositionX = 0;
  drawScanLines = function(output) {
    var i, line, lines, _len;
    if (!scanLinesOn) {
      return;
    }
    lines = output.split('\n');
    for (i = 0, _len = lines.length; i < _len; i++) {
      line = lines[i];
      lines[i] = lines[i].replaceAt(drawScanLinePositionX, OFF);
    }
    if (Math.random() > .5) {
      if (drawScanLinePositionX < '<div>'.length) {
        lines[i] += (new Array(Math.floor(Math.random() * HEIGHT))).join(ON);
      }
      drawScanLinePositionX += Math.random() > .5 ? 1 : -1;
    }
    drawScanLinePositionX = Math.min(WIDTH, Math.max(0, drawScanLinePositionX));
    output = lines.join('\n');
    return output;
  };
  lineDirection = 1;
  linePosition = void 0;
  lineReplace = ON;
  line = function(output) {
    var halfLineWidth, outputArray, position, _ref, _ref2;
    if (!lineOn) {
      return output;
    }
    outputArray = output.split('');
    if (Math.random() < .05) {
      lineReplace = (outputArray[linePosition] === ON ? OFF : ON);
    }
    halfLineWidth = Math.floor(WIDTH / 20);
    for (position = _ref = linePosition - halfLineWidth, _ref2 = linePosition + halfLineWidth; _ref <= _ref2 ? position <= _ref2 : position >= _ref2; _ref <= _ref2 ? position++ : position--) {
      outputArray[position] = lineReplace;
    }
    output = outputArray.join('');
    lineDirection *= Math.random() > .1 ? 1 : -1;
    linePosition = linePosition + lineDirection;
    linePosition = Math.min(Math.max(halfLineWidth + 1, linePosition), WIDTH - halfLineWidth - 1);
    return output;
  };
  ballDirectionX = 1;
  ballDirectionY = 1;
  ballPositionX = void 0;
  ballPositionY = void 0;
  ballReplace = ON;
  drawBall = function(output) {
    var ballHeight, ballWidth, halfBallHeight, halfBallWidth, i, line, lines, position, _len, _ref, _ref2;
    if (!ballOn) {
      return output;
    }
    lines = output.split('\n');
    ballHeight = 6;
    ballWidth = 16;
    halfBallHeight = 3;
    halfBallWidth = 8;
    for (i = 0, _len = lines.length; i < _len; i++) {
      line = lines[i];
      if ((ballPositionY - halfBallHeight < i && i < ballPositionY + halfBallHeight)) {
        for (position = _ref = ballPositionX - halfBallWidth, _ref2 = ballPositionX + halfBallWidth; _ref <= _ref2 ? position <= _ref2 : position >= _ref2; _ref <= _ref2 ? position++ : position--) {
          lines[i] = lines[i].replaceAt(position, (lines[i][position] === OFF ? ON : '─'));
        }
      }
    }
    output = lines.join('\n');
    ballDirectionX *= Math.random() > .1 ? 1 : -1;
    ballPositionX = ballPositionX + ballDirectionX;
    ballPositionX = Math.min(Math.max(halfBallWidth + 2, ballPositionX), WIDTH - halfBallWidth - 2);
    ballDirectionY *= Math.random() > .1 ? 1 : -1;
    ballPositionY = ballPositionY + ballDirectionY;
    ballPositionY = Math.floor(Math.min(Math.max(halfBallHeight + 2, ballPositionY), (HEIGHT / WIDTH) - halfBallHeight - 2));
    return output;
  };
  setInterval(hills, 70 * HEIGHT);
  setInterval(random, 70);
  adjustWidth = function() {
    WIDTH = Math.floor(window.outerWidth / 7);
    HEIGHT = Math.floor(WIDTH * (window.outerHeight / 22));
    linePosition = Math.floor(WIDTH / 2);
    ballPositionX = Math.floor(WIDTH / 2);
    return ballPositionY = Math.floor(HEIGHT / 2);
  };
  emptyPre = function() {
    pre.innerHTML = '';
    return stream = [];
  };
  setTimeout(emptyPre, 0);
  setTimeout(adjustWidth, 0);
  window.addEventListener('resize', adjustWidth);
  window.addEventListener('resize', emptyPre);
  window.addEventListener('fullscreeneventchange', emptyPre);
  window.addEventListener('fullscreeneventchange', function() {
    return log('fullscreeneventchange');
  });
  setTimeout((function() {
    return document.body.addEventListener('fullscreeneventchange', function() {
      return log('fullscreeneventchange');
    });
  }), 0);
  lastHTML = '';
  colorOpacity = 0.01;
  frames = 0;
  inverted = 'inverted';
  draw = function() {
    var next, nextHTML;
    frames += 1;
    next = nextLine();
    if (!next) {
      return;
    }
    if (Math.random() < .005) {
      pre.setAttribute('data-bg', Math.floor(Math.random() * 3));
    }
    if (drawPre) {
      nextHTML = ("<div>" + next + "</div>\n") + lastHTML;
    }
    nextHTML = nextHTML.substr(0, HEIGHT * 2);
    lastHTML = nextHTML;
    nextHTML = drawBall(lastHTML);
    nextHTML = drawScanLines(nextHTML);
    pre.innerHTML = nextHTML;
    if (Math.random() > .97) {
      colorOpacity += (colorOpacity = .001) ? .01 : .001;
    }
    pre.innerHTML += '<div id="color" style="opacity: ' + colorOpacity + '"></div>';
    if (Math.random() > .3) {
      pre.innerHTML = pre.innerHTML.replace(new RegExp('opacity: \d?\.\d?', 'g'), '');
    }
    if (frames * (1400 / 34) > 1000 * 60 * 3.3) {
      try {
        return document.head.removeChild(document.getElementById('deathRed'));
      } catch (_e) {}
    }
  };
  window.drawInterval = setInterval(draw, 34);
  drainTimes = 0;
  drain = function() {
    stream = [];
    if (drainTimes > 80) {
      return drainTimes = 0;
    }
    drainTimes += 1;
    return setTimeout(function() {
      emptyPre();
      adjustWidth();
      return drain();
    }, 20);
  };
  document.addEventListener('dblclick', function() {
    if (document.webkitIsFullScreen) {
      document.webkitCancelFullScreen();
    } else {
      document.body.webkitRequestFullScreen();
    }
    return drain();
  });
}).call(this);
