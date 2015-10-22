/* jslint node: true */
"use strict";

var PositionMarker = require('./PositionMarker');
var ClosestStationsControl = require('./ClosestStationsControl');

function PositionFlow(config, map, velomagg, i18n) {
  this.config = config;
  this.map = map;
  this.velomagg = velomagg;
  this.i18n = i18n;
}

PositionFlow.prototype.setUp = function setUp() {
  this._watchPosition();
};

PositionFlow.prototype._watchPosition = function _watchPosition() {
  var options = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 0
  };
  window.navigator.geolocation.watchPosition(this._localizeUser.bind(this), console.log, options);
};

function userIsCloseEnoughFromAStation(latitude, longitude) {
  //bounding box : NE:43.67 3.99, SW:43.56 3.77
  return latitude <= 43.67 && latitude >= 43.56 &&
    longitude <= 3.99 && longitude >= 3.77;
}

PositionFlow.prototype._localizeUser = function _localizeUser(geo) {
  var latitude = geo.coords.latitude;
  var longitude = geo.coords.longitude;

  if (userIsCloseEnoughFromAStation(latitude, longitude)) {
    this._initializePositionMarker();
    this.position_marker.updatePosition([latitude, longitude]);
  }
};

PositionFlow.prototype._initializePositionMarker = function _initializePositionMarker() {
  if (this.position_marker) {
    return;
  }

  this.position_marker = new PositionMarker();
  this.position_marker.addTo(this.map);
  var control = new ClosestStationsControl({
    colors: this.config.colors,
    i18n: this.i18n
  });
  control.addTo(this.map);

  function updateControl() {
    control.update(this.velomagg, this.position_marker.getPosition());
  }

  this.position_marker.on('move', updateControl.bind(this));
  this.velomagg.on('update', updateControl.bind(this));
};

module.exports = PositionFlow;