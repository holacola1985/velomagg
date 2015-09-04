/* jslint node: true */
"use strict";

var L = window.L;
var AbstractBackboneMarker = require('leaflet-backbone-layer').AbstractBackboneMarker;
var renderPopup = require('./popup.hbs');
var Indicator = require('./Indicator');

var template = '' +
  '<canvas></canvas>' +
  '<div class="text"></div>' +
  '<div class="in">' +
  '  <span class="change">' +
  '    +<span class="count">1</span> ' +
  '    <span class="bike fa fa-bicycle"></span>' +
  '  </span>' +
  '</div>' +
  '<div class="out">' +
  '   <span class="change">' +
  '    <span class="count">1</span> ' +
  '    <span class="bike fa fa-bicycle"></span>' +
  '  </span>' +
  '</div>';

var zoom_factor = {
  14: 1,
  13: 0.6,
  12: 0.5,
  11: 0.45,
  10: 0.4,
  9: 0.35,
  8: 0.3,
  7: 0.3,
  6: 0.25,
  5: 0.25,
  4: 0.25,
  3: 0.2,
  2: 0.2,
  1: 0.2
};

var StationMarker = AbstractBackboneMarker.extend({
  className: 'station-marker',
  events: {
    click: 'onClick'
  },
  initialize: function (options) {
    AbstractBackboneMarker.prototype.initialize.call(this, options);
    this.initial_size = {
      height: this.$el.height(),
      width: this.$el.width()
    };
    this.popup = L.popup({
      className: 'station-popup',
      offset: L.point(0, -10)
    });
  },
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
  renderElements: function () {
    this.defineScalingFactor();
    this.resizeRootElement();
    this.renderText();
    this.renderIndicator();
    this.renderPopup();
  },
  defineScalingFactor: function () {
    this.scaling_factor = zoom_factor[Math.min(14, this.map.getZoom())];
  },
  resizeRootElement: function () {
    this.$el.height(this.initial_size.height * this.scaling_factor);
    this.$el.width(this.initial_size.width * this.scaling_factor);
    this.$el.css('margin-top', -this.initial_size.height * this.scaling_factor / 2);
    this.$el.css('margin-left', -this.initial_size.width * this.scaling_factor / 2);
  },
  renderText: function () {
    this.$text = this.$text || this.$('div.text');
    if (this.scaling_factor < 1) {
      this.$text.hide();
    } else {
      this.$text.html(this.text());
      this.$text.show();
    }
  },
  renderIndicator: function () {
    this.resizeCanvas();
    this.indicator = new Indicator(this.$canvas[0]);
    this.indicator.render(this.bikePercentage());
  },
  renderPopup: function () {
    this.popup
      .setLatLng(this.model.coordinates())
      .setContent(renderPopup(this.model.toJSON()));
  },
  resizeCanvas: function () {
    this.$canvas = this.$canvas || this.$('canvas');
    this.$canvas[0].width = this.$el.width();
    this.$canvas[0].height = this.$el.height();
    this.$canvas.width(this.$el.width());
    this.$canvas.height(this.$el.height());
  },
  reset: function () {
    this.refreshRendering();
  },
  onClick: function (event) {
    event.stopPropagation();
    this.openPopup();
  },
  openPopup: function () {
    this.popup.openOn(this.map);
  },
  animate: function () {
    var change = this.bikesChange();
    if (!change) {
      return;
    }
    this.$in = this.$in || this.$('div.in');
    this.$out = this.$out || this.$('div.out');

    var div_to_display = change > 0 ? this.$in : this.$out;
    var div_to_hide = change > 0 ? this.$out : this.$in;

    div_to_hide.hide();
    div_to_display.find('.count').html(change);
    div_to_display.show();
    setTimeout(function(){
      div_to_display.hide();
    }, 1500);
  }
});

module.exports = StationMarker;