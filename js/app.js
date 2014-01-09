(function() {
  var tv;
  tv = {};
  tv.currentVisualization = 0;
  tv.visualizations = ['pareidolia', 'fluid', 'reactive', 'generator'];
  tv.init = function() {
    tv.setupDOM();
    tv.setupVisualizationLoadEvents();
    return tv.setupControls();
  };
  tv.setupDOM = function() {
    tv.$display = $('iframe');
    tv.$cover = $('.cover');
    return tv.$party = $('.party');
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
      switch (e.keyCode) {
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
          if (tv.$party.hasClass('hidden')) {
            return tv.$party.removeClass('hidden');
          } else {
            return tv.$party.addClass('hidden');
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
        default:
          return console.log(e.keyCode);
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
  tv.init();
  window.tv = tv;
}).call(this);
