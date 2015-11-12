/* jslint node: true */
"use strict";

var PositionMarker = require('./PositionMarker');
var ClosestStationsControl = require('./ClosestStationsControl');
require('mapbox-directions-api');
var L = require('mapbox.js');

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
  if (!this.velomagg.length) {
    return;
  }
  var latitude = geo.coords.latitude;
  var longitude = geo.coords.longitude;

  if (this._userIsCloseEnoughFromAStation(latitude, longitude)) {
    this._initializePositionMarker(latitude, longitude);
    if (this.position_marker) {
      this.position_marker.updatePosition([latitude, longitude]);
    }
  }
};

PositionFlow.prototype._initializePositionMarker = function _initializePositionMarker(latitude, longitude) {
  if (this.position_marker) {
    return;
  }

  this.position_marker = new PositionMarker();
  this.position_marker.addTo(this.map);

  this._initializeControl();
  this._displayShortestPaths(latitude, longitude);
};

PositionFlow.prototype._displayShortestPaths = function _displayShortestPaths(latitude, longitude) {
  var closest_stations = this.velomagg.closestStations(L.latLng(latitude, longitude));
  this.closest_bike = closest_stations.filter(function (station) {
    return station.data.available_bikes > 0;
  })[0];
  this.closest_slot = closest_stations.filter(function (station) {
    return station.data.free_slots > 0;
  })[0];

  this.routes = [];
  this._displayPath('walking', [latitude, longitude], this.closest_bike, this.config.colors.bikes);
  this._displayPath('cycling', [latitude, longitude], this.closest_slot, this.config.colors.slots);
};

PositionFlow.prototype._displayPath = function _displayPath(type, current_position, station, color) {
  var directions = L.mapbox.directionsAPI();

  directions.setProfile('mapbox.' + type);
  directions.setOrigin(current_position);
  directions.setDestination(station.coordinates);

  directions.on('load', function (directions) {
    station[type] = shortestRoute(directions);
    this._drawPath(station[type], color);
    this._centerMap();
    this._updateControl();
  }, this);
  directions.query();
};

PositionFlow.prototype._drawPath = function _drawPath(route, color) {
  var options = {
    color: color,
    dashArray: [10, 10],
    opacity: 0.7
  };
  var coordinates = route.geometry.coordinates
    .map(function (coordinate) {
      return [coordinate[1], coordinate[0]];
    });
  var polyline = L.polyline(coordinates, options).addTo(this.map);

  this.routes.push({
    route: route,
    path: polyline
  });
};

function shortestRoute(directions) {
  return directions.routes.sort(function (a, b) {
    return a.duration - b.duration;
  })[0];
}

PositionFlow.prototype._centerMap = function _centerMap() {
  var longest_path = this.routes.sort(function (a, b) {
    return b.route.distance - a.route.distance;
  })[0].path;

  this.map.fitBounds(longest_path.getBounds());
};

PositionFlow.prototype._initializeControl = function _initializeControl() {
  this.control = new ClosestStationsControl({
    colors: this.config.colors,
    i18n: this.i18n
  });
  this.control.addTo(this.map);

  this.position_marker.on('move', this._updateControl, this);
  this.velomagg.on('update', this._updateControl, this);
};

PositionFlow.prototype._updateControl = function _updateControl() {
  this.control.update({
    closest_available_bike: this.closest_bike,
    closest_free_slot: this.closest_slot
  });
};

module.exports = PositionFlow;