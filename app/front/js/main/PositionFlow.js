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

PositionFlow.prototype._userIsCloseEnoughFromAStation = function _userIsCloseEnoughFromAStation(latitude, longitude) {
  return latitude <= this.config.bounding_box.north_east[1] &&
    latitude >= this.config.bounding_box.south_west[1] &&
    longitude <= this.config.bounding_box.north_east[0] &&
    longitude >= this.config.bounding_box.south_west[0];
};

PositionFlow.prototype._localizeUser = function _localizeUser(geo) {
  var latitude = geo.coords.latitude;
  var longitude = geo.coords.longitude;

  if (this._userIsCloseEnoughFromAStation(latitude, longitude)) {
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