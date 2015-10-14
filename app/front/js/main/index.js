'use strict';
var config = require('../../../../config/public.json');
require('mapbox.js');
var L = window.L;
var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
var React = require('react');
var VeloMap = require('./VeloMap.jsx');
Backbone.$ = $;
var tween = require('tween.js');
var raf = require('raf');

//var BackboneLayer = require('leaflet-backbone-layer').BackboneLayer;
var MapboxSocket = require('lightstream-socket').MapboxSocket;
var VelomaggStation = require('lightstream-backbone').ItemBackboneModel;
//var StationMarker = require('./StationMarker');
var Collection = Backbone.Collection.extend({
  model: VelomaggStation
});
//var PositionMarker = require('./PositionMarker');
//var ClosestStationsControl = require('./ClosestStationsControl');

raf(function tick(time){
  tween.update(time); 
  raf(tick);
});

L.mapbox.accessToken = 'pk.eyJ1IjoiZnJhbmNrZXJuZXdlaW4iLCJhIjoiYXJLM0dISSJ9.mod0ppb2kjzuMy8j1pl0Bw';
L.mapbox.config.FORCE_HTTPS = true;
L.mapbox.config.HTTPS_URL = 'https://api.tiles.mapbox.com/v4';

(function(config) {
  var map_not_attached = true;
  var position_marker;

  var velomagg = new Collection();
  var map = initializeMap();
  createLayer(map, velomagg);
  watchPosition();
  openSocket(map, velomagg);

  function initializeMap() {
    //test : 43.607653, 3.881696
    return L.mapbox.map('map').setView([43.605, 3.88], 14);
  }

  function createLayer(map, velomagg) {
    var mapElement = React.createElement(VeloMap, {
      collection: velomagg,
      map: map
    });
    React.render(mapElement, document.getElementById('map-component'));
  }

  function openSocket(map, velomagg) {
    var options = {
      retry_interval: 5000
    };
    var socket = new MapboxSocket('ws://' + config.hostname + '/socket/', 'station', options);

    socket.on('opened', function() {
      if (map_not_attached) {
        socket.attachMap(map);
        map_not_attached = true;
      }
    });

    socket.on('new_items', function(stations) {
      //if(velomagg.length < 1){
        velomagg.add(stations);
      //}
    });

    socket.on('error', function(error) {
      console.log('error in socket', error);
    });

    socket.on('closed', function() {
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
    window.navigator.geolocation.watchPosition(localizeUser, console.log, options);
  }

  function userIsCloseEnoughFromAStation(latitude, longitude) {
    //bounding box : NE:43.67 3.99, SW:43.56 3.77
    return latitude <= 43.67 && latitude >= 43.56 &&
      longitude <= 3.99 && longitude >= 3.77;
  }

  function localizeUser(geo) {
    var latitude = geo.coords.latitude;
    var longitude = geo.coords.longitude;

    if (userIsCloseEnoughFromAStation(latitude, longitude)) {
      var current_position = [latitude, longitude];
      //map.setView(current_position, 16);
      position_marker = position_marker || initializePositionMarker(map, velomagg);
      position_marker.updatePosition(current_position);
    }
  }
  
  function fakeChange(){
    const ids = velomagg.pluck('id');
    if(ids.length){
      const id = _.sample(ids);
      let station = velomagg.get(id);
      let data = _.clone(station.get('data'));
      data.available_bikes = _.random(data.total);
      station.set('data', data);
    }
    setTimeout(fakeChange, Math.random() * 2000);
  }
  //Uncomment to emulate changes
  //fakeChange();


  function initializePositionMarker() {
    /*
    var marker = new PositionMarker();
    marker.addTo(map);
    var control = new ClosestStationsControl();
    control.addTo(map);

    function updateControl() {
      control.update(velomagg, marker.getPosition());
    }

    marker.on('move', updateControl);
    velomagg.on('update', updateControl);

    return marker;
    */
  }
})(config);
