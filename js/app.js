(function() {
  var tv;
  tv = {};
  tv.currentVisualization = 0;
  tv.visualizations = ['pareidolia', 'fluid', 'reactive', 'generator', 'tumbler'];
  tv.setupDOM = function() {
    tv.$permissionsBar = $('.permissions-bar');
    tv.$permissionsMessage = $('.permissions-message');
    tv.$display = $('iframe');
    tv.$cover = $('.cover');
    tv.$party = $('.party');
    return tv.$controls = $('.controls');
  };
  tv.handleWelcome = function() {
    var _ref, _ref2;
    if (!((_ref = location.search) != null ? (_ref2 = _ref.match(/\?welcome/)) != null ? _ref2.length : void 0 : void 0)) {
      return;
    }
    return tv.showControls();
  };
  tv.toggleControls = function() {
    if (tv.$controls.hasClass('show')) {
      return tv.hideControls();
    } else {
      return tv.showControls();
    }
  };
  tv.showControls = function() {
    return tv.$controls.addClass('show');
  };
  tv.hideControls = function() {
    return tv.$controls.removeClass('show');
  };
  tv.setupVisualizationLoadEvents = function() {
    return tv.$display.load(function() {
      return tv.$cover.removeClass('covered choked');
    });
  };
  tv.setupControls = function() {
    tv.$cover.focus();
    tv.$cover.blur(function() {
      return tv.$cover.focus();
    });
    tv.$cover.dblclick(function(e) {
      return tv.advance();
    });
    return $(window).keydown(function(e) {
      console.log(e, e.keyCode);
      switch (e.keyCode) {
        case 67:
          tv.$party.removeClass('smooth').addClass('hidden');
          $('html').removeClass('party-zoom party-zoom-fast');
          tv.$cover.removeClass('covered');
          tv.$display.attr('data-filter-hue-rotate', true);
          tv.$display.removeAttr('data-filter-invert');
          return tv.hideControls();
        case 13:
          return tv.renderCurrentVisualization();
        case 39:
          return tv.advance();
        case 37:
          return tv.advance(-1);
        case 38:
          return tv.advance(-1);
        case 40:
          return tv.advance();
        case 80:
          if (e.shiftKey) {
            if (tv.$party.hasClass('smooth')) {
              return tv.$party.removeClass('smooth');
            } else {
              return tv.$party.addClass('smooth');
            }
          } else {
            if (tv.$party.hasClass('hidden')) {
              return tv.$party.removeClass('hidden');
            } else {
              return tv.$party.addClass('hidden');
            }
          }
          break;
        case 90:
          if (e.shiftKey) {
            if ($('html').hasClass('party-zoom-fast')) {
              return $('html').removeClass('party-zoom-fast');
            } else {
              return $('html').addClass('party-zoom-fast');
            }
          } else {
            if ($('html').hasClass('party-zoom')) {
              return $('html').removeClass('party-zoom');
            } else {
              return $('html').addClass('party-zoom');
            }
          }
          break;
        case 222:
          return tv.advance(Math.floor(tv.visualizations.length * Math.random()));
        case 70:
          if (tv.$cover.hasClass('covered')) {
            return tv.$cover.removeClass('covered choked');
          } else {
            return tv.$cover.addClass('covered');
          }
          break;
        case 66:
          if (tv.$cover.hasClass('choked')) {
            return tv.$cover.removeClass('covered choked');
          } else {
            return tv.$cover.addClass('choked');
          }
          break;
        case 72:
          if (tv.$display.attr('data-filter-hue-rotate')) {
            return tv.$display.removeAttr('data-filter-hue-rotate');
          } else {
            return tv.$display.attr('data-filter-hue-rotate', true);
          }
          break;
        case 73:
          if (tv.$display.attr('data-filter-invert')) {
            return tv.$display.removeAttr('data-filter-invert');
          } else {
            return tv.$display.attr('data-filter-invert', true);
          }
          break;
        case 191:
          if (e.shiftKey) {
            return tv.toggleControls();
          }
      }
    });
  };
  tv.advance = function(amount) {
    if (amount == null) {
      amount = 1;
    }
    tv.$cover.addClass('covered');
    tv.currentVisualization = (tv.currentVisualization + tv.visualizations.length + amount) % tv.visualizations.length;
    return setTimeout(function() {
      return tv.renderCurrentVisualization();
    }, 750);
  };
  tv.renderCurrentVisualization = function() {
    return tv.$display.attr('src', '/tv/visualizations/' + tv.visualizations[tv.currentVisualization]);
  };
  setTimeout(function() {
    return $('body').addClass('loaded');
  });
  tv.attemptingGetUserMedia = function() {
    tv.setupDOM();
    tv.$permissionsBar.addClass('show');
    return tv.$permissionsMessage.addClass('show');
  };
  tv.getUserMediaSucceeded = function() {
    tv.$permissionsBar.removeClass('show');
    tv.$permissionsMessage.removeClass('show');
    setTimeout(function() {
      tv.$permissionsBar.remove();
      return tv.$permissionsMessage.remove();
    }, 800);
    tv.setupVisualizationLoadEvents();
    tv.setupControls();
    return setTimeout(function() {
      tv.handleWelcome();
      return tv.renderCurrentVisualization();
    }, 300);
  };
  tv.getUserMediaFailed = function() {
    tv.$permissionsBar.removeClass('show');
    return tv.$permissionsMessage.html('Could not get access to your mic. <br/> Please refresh and try again.');
  };
  window.tv = tv;
}).call(this);
