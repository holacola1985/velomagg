/* jslint node: true */
"use strict";

var L = global.L;

var PositionIcon = L.DivIcon.extend({
  options: {
    iconAnchor: [8, 15],
    iconSize: [30, 30],
    popupAnchor: [0, -15],
    html: '<i class="fa fa-male"></i>',
    className: 'position'
  }
});

var PositionMarker = L.Marker.extend({
  options: {
    icon: new PositionIcon()
  },
  initialize: function (options) {
    L.Marker.prototype.initialize.call(this, options);
    this.setLatLng([0, 0]);
  },
  updatePosition: function updatePosition(position) {
    this.setLatLng(position);
    this.update();
  },
  getPosition: function () {
    return this.getLatLng();
  }
});

module.exports = PositionMarker;