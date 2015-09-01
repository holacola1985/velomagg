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

L.mapbox.accessToken = 'pk.eyJ1IjoiZnJhbmNrZXJuZXdlaW4iLCJhIjoiYXJLM0dISSJ9.mod0ppb2kjzuMy8j1pl0Bw';
L.mapbox.config.FORCE_HTTPS = true;
L.mapbox.config.HTTPS_URL = 'https://api.tiles.mapbox.com/v4';
var map;

var Collection = Backbone.Collection.extend({
  model: VelomaggStation
});

function createMarker(options) {
  return new StationMarker(options);
}

var options = {
  max_retries: 2,
  retry_interval: 2000
};
var socket = new MapboxSocket('ws://' + config.hostname + '/socket/', 'station', options);
var collection = new Collection();

socket.on('opened', function () {
  map = map || initializeMap(socket, collection);
});

function initializeMap(socket, collection) {
  var map = L.mapbox.map('map', 'mapbox.light')
    .setView([43.6, 3.91], 13);
  socket.attachMap(map);

  var layer = new BackboneLayer(collection, createMarker);
  map.addLayer(layer);

  return map;
}

socket.on('new_items', function (stations) {
  collection.set(stations, { remove:false });
});

socket.on('error', function (error) {
  console.log('error in socket', error);
});

socket.on('closed', function () {
  console.log('socket has been closed');
});

$('#search').on('submit', function (event) {
  event.preventDefault();

  socket.changeFilter({
    name: this.q.value
  });
});

socket.connect();
