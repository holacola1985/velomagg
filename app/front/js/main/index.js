var config = require('../../../../config/public.json');
require('mapbox.js');
var L = window.L;
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;

var BackboneLayer = require('leaflet-backbone-layer').BackboneLayer;
var MapboxSocket = require('lightstream-socket').MapboxSocket;
var VelomaggStation = require('lightstream-backbone').ItemBackboneModel;
var StationMarker = require('./StationMarker');
var Collection = Backbone.Collection.extend({
  model: VelomaggStation
});
var PositionMarker = require('./PositionMarker');
var ClosestStationsControl = require('./ClosestStationsControl');

L.mapbox.accessToken = 'pk.eyJ1IjoiZnJhbmNrZXJuZXdlaW4iLCJhIjoiYXJLM0dISSJ9.mod0ppb2kjzuMy8j1pl0Bw';
L.mapbox.config.FORCE_HTTPS = true;
L.mapbox.config.HTTPS_URL = 'https://api.tiles.mapbox.com/v4';

(function (config) {
  var map_not_attached = true;
  var position_marker;

  var stations = new Collection();
  var map = initializeMap();
  createLayer(map, stations);
  watchPosition();
  openSocket(map, stations);

  function initializeMap() {
    //test : 43.607653, 3.881696
    return L.mapbox.map('map', 'mapbox.light')
      .setView([43.605, 3.88], 14);
  }

  function createLayer(map, stations) {
    function createMarker(options) {
      return new StationMarker(options);
    }

    var layer = new BackboneLayer(stations, createMarker);
    map.addLayer(layer);
  }

  function openSocket(map, stations) {
    var options = {
      retry_interval: 5000
    };
    var socket = new MapboxSocket('ws://' + config.hostname + '/socket/', 'station', options);

    socket.on('opened', function () {
      if (map_not_attached) {
        socket.attachMap(map);
        map_not_attached = true;
      }
    });

    socket.on('new_items', function (stations) {
      stations.set(stations, { remove:false });
    });

    socket.on('error', function (error) {
      console.log('error in socket', error);
    });

    socket.on('closed', function () {
      console.log('socket has been closed');
    });

    socket.connect();
  }

  function watchPosition() {
    var options = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 0
    };
    navigator.geolocation.watchPosition(localizeUser, console.log, options);
  }

  function localizeUser(geo) {
    var latitude = geo.coords.latitude;
    var longitude = geo.coords.longitude;

    //bounding box : NE:43.67 3.99, SW:43.56 3.77
    if (latitude <= 43.67 && latitude >= 43.56 &&
      longitude <= 3.99 && longitude >= 3.77) {
      var current_position = [latitude, longitude];
      map.setView(current_position, 16);
      position_marker = position_marker || initializePositionMarker(map, stations);
      position_marker.updatePosition(current_position);
    }
  }

  function initializePositionMarker(map, stations) {
    var marker = new PositionMarker();
    marker.addTo(map);
    var control = new ClosestStationsControl();
    control.addTo(map);

    function updateControl() {
      control.update(stations, marker.getPosition())
    }

    marker.on('move', updateControl);
    stations.on('update', updateControl);

    return marker;
  }
})(config);
