/* jslint node: true */
"use strict";

var AbstractBackboneMarker = require('leaflet-backbone-layer').AbstractBackboneMarker;

var template = '' +
  '<canvas></canvas>' +
  '<div class="text"></div>' +
  '<div class="in">' +
  ' <span class="change">+1</span>' +
  '</div>' +
  '<div class="out">' +
  ' <span class="change">-1</span>' +
  '</div>';

var StationMarker = AbstractBackboneMarker.extend({
  className: 'station-marker',
  station: function () {
    return this.model.toJSON().data;
  },
  text: function () {
    return this.station().available_bikes + '/' + this.station().total;
  },
  bikePercentage: function () {
    return this.station().available_bikes / this.station().total;
  },
  bikesChange: function () {
    if (!this.model._previousAttributes.data) {
      return 0;
    }
    return this.station().available_bikes - this.model._previousAttributes.data.available_bikes;
  },
  applyTemplate: function () {
    return template;
  },
  render: function () {
    AbstractBackboneMarker.prototype.render.call(this);
    this.$in = this.$('div.in');
    this.$out = this.$('div.out');
  },
  rerender: function () {
    this.renderText();
    this.renderIndicator();
    this.setPosition();
    this.animate();
  },
  renderText: function () {
    this.$('div.text').html(this.text());
  },
  renderIndicator: function () {
    var canvas = this.resetCanvas();
    this.indicator = new Indicator(canvas, 0.7);
    this.indicator.render(this.bikePercentage());
  },
  resetCanvas: function () {
    var canvas = this.$('canvas')[0];
    canvas.width = this.$el.width();
    canvas.height = this.$el.height();
    return canvas;
  },
  animate: function () {
    var change = this.bikesChange();
    if (!change) {
      return;
    }

    var div_to_display = change > 0 ? this.$in : this.$out;
    var div_to_hide = change > 0 ? this.$out : this.$in;
    var sign = change > 0 ? '+' : '';

    div_to_hide.hide();
    div_to_display.find('.change').html(sign + change + ' <span class="bike fa fa-bicycle"></span>');
    div_to_display.show();
    setTimeout(function(){
      div_to_display.hide();
    }, 1500);
  }
});

var Indicator = (function () {
  return function (canvas, radius_rate) {
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var outer_radius = Math.min(centerX, centerY);
    var inner_radius = Math.max(outer_radius * radius_rate, 3);

    var context = canvas.getContext('2d');

    function drawArc(color, radius, start, end) {
      context.fillStyle = color;
      context.beginPath();
      context.moveTo(centerX, centerY);
      context.arc(centerX, centerY, radius, start || 0, end || 2 * Math.PI, false);
      context.fill();
      context.closePath();
    }

    this.render = function render(percentage) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawArc('#ea5b0c', outer_radius);
      drawArc('#95c11f', outer_radius, 1.5 * Math.PI, (1.5 + 2 * percentage) * Math.PI);
      drawArc('#ffffff', inner_radius);
    };
  }
})();

module.exports = StationMarker;