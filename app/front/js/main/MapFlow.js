/* jslint node: true */
'use strict';

var React = require('react');
var MapboxSocket = require('lightstream-socket').MapboxSocket;
var VelomaggCollection = require('./VelomaggCollection');
var MapQuadtree = require('../lib/MapQuadtree');
var L = require('mapbox.js');

//var StationMarker = require('./StationMarker');
var VeloMap = require('./VeloMap.jsx');

function createLayer(map, quadtree) {
  var mapElement = React.createElement(VeloMap, {
    quadtree: quadtree,
    map: map
  });
  React.render(mapElement, document.getElementById('map-component'));
}

function MapFlow(config) {
  this.config = config;
}

MapFlow.prototype.setUp = function setUp() {
  this.velomagg = new VelomaggCollection();
  this.map = initializeMap();
  this._initializeQuadtree();
  createLayer(this.map, this.quadtree);
  this._openSocket();
};

function initializeMap() {
  //test : 43.607653, 3.881696
  return L.mapbox.map('map')
    .setView([43.605, 3.88], 16);
}

MapFlow.prototype._initializeQuadtree = function _initializeQuadtree() {
  var bounds = this._mapBoundsToQuadtreeBounds();
  var quadtree = this.quadtree = new MapQuadtree(bounds, 4, 3);

  this.velomagg.on('add', function (model) {
    quadtree.addItem(model);
  });

  this.map.on('moveend', function () {
    quadtree.move(this._mapBoundsToQuadtreeBounds());
  }.bind(this));

  /*
  quadtree.on('changed', function () {
    this.map.getPanes().markerPane.innerHTML = '';

    quadtree.flatten().forEach(function (cluster) {
      var marker = new StationMarker({
        model: new StationCluster(cluster),
        map: this.map
      });
      marker.render();
    }.bind(this));
  }.bind(this));
  */
};

MapFlow.prototype._mapBoundsToQuadtreeBounds = function _mapBoundsToQuadtreeBounds() {
  var bounds = this.map.getBounds();
    return {
    south_west: {
      latitude: bounds._southWest.lat,
      longitude: bounds._southWest.lng
    },
    north_east: {
      latitude: bounds._northEast.lat,
      longitude: bounds._northEast.lng
    }
  };
};

MapFlow.prototype._openSocket = function _openSocket() {
  var options = {
    retry_interval: 5000
  };
  var socket = new MapboxSocket('ws://' + this.config.hostname + '/socket/', 'station', options);

  socket.on('opened', function () {
    if (!this.map_attached) {
      socket.attachMap(this.map);
      this.map_attached = true;
    }
  }.bind(this));

  socket.on('new_items', function (station) {
    this.velomagg.set([station], { remove:false });
  }.bind(this));

  socket.on('error', function (error) {
    console.log('error in socket', error);
  });

  socket.on('closed', function () {
    console.log('socket has been closed');
  });

  socket.connect();
};

module.exports = MapFlow;
