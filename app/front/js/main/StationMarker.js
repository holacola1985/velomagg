/* jslint node: true */
"use strict";

var L = window.L;
var Backbone = require('Backbone');
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
  '  <span class="change">' +
  '    <span class="count">1</span> ' +
  '    <span class="bike fa fa-bicycle"></span>' +
  '  </span>' +
  '</div>';

var StationMarker = Backbone.View.extend({
  className: 'station-marker',
  events: {
    click: 'onClick'
  },
  initialize: function (options) {
    this.map = options.map;
    this.map.getPanes().markerPane.appendChild(this.$el[0]);
    this.map.on('moveend', this.reset, this);

    this.popup = L.popup({
      className: 'station-popup',
      offset: L.point(0, -10)
    });

    this.model.on('change', this.refreshRender, this);
  },
  text: function () {
    return this.model.availableBikes() + '/' + this.model.total();
  },
  bikePercentage: function () {
    return this.model.availableBikes() / this.model.total();
  },
  applyTemplate: function () {
    return template;
  },
  renderRootElement: function () {
    this.$el.html(this.applyTemplate());
    this.$text = this.$('div.text');
    this.$canvas = this.$('canvas');
    this.$in = this.$('div.in');
    this.$out = this.$('div.out');
  },
  render: function render() {
    this.renderRootElement();
    this.renderElements();
    this.setPosition();
  },
  refreshRender: function refreshRender(change) {
    this.renderElements();
    this.animate(change);
  },
  renderElements: function () {
    this.renderText();
    this.renderIndicator();
    this.renderPopup();
  },
  renderText: function () {
    this.$text.html(this.text());
  },
  renderIndicator: function () {
    this.resizeCanvas();
    this.indicator = new Indicator(this.$canvas[0]);
    this.indicator.render(this.bikePercentage());
  },
  renderPopup: function () {
    this.popup
      .setLatLng(this.model.coordinates())
      .setContent(renderPopup({
        name: this.model.name(),
        available_bikes: this.model.availableBikes(),
        free_slots: this.model.freeSlots(),
        total: this.model.total()
      }));
  },
  resizeCanvas: function () {
    this.$canvas[0].width = this.$el.width();
    this.$canvas[0].height = this.$el.height();
    this.$canvas.width(this.$el.width());
    this.$canvas.height(this.$el.height());
  },
  reset: function () {
    this.map.closePopup(this.popup);
    this.setPosition();
  },
  onClick: function (event) {
    event.stopPropagation();
    this.openPopup();
  },
  openPopup: function () {
    this.popup.openOn(this.map);
  },
  getPosition: function () {
    return this.map.latLngToLayerPoint(this.model.coordinates());
  },
  setPosition: function setPosition() {
    var el = this.$el[0];
    L.DomUtil.setPosition(el, this.getPosition(), true);
  },
  animate: function (change) {
    if (!change) {
      return;
    }

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