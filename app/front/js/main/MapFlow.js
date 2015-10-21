/* jslint node: true */
'use strict';

var React = require('react');
var MapboxSocket = require('lightstream-socket').MapboxSocket;
var VelomaggCollection = require('./VelomaggCollection');
var MapQuadtree = require('../lib/MapQuadtree');
var BoundingBox = require('../lib/BoundingBox');
var L = require('mapbox.js');

var VeloMap = require('./VeloMap.jsx');

function MapFlow(config) {
  this.config = config;
}

MapFlow.prototype.setUp = function setUp() {
  this.velomagg = new VelomaggCollection();

  this._initializeMap();
  this._initializeQuadtree();
  this._createLayer();
  this._openSocket();
};

MapFlow.prototype._initializeMap = function _initializeMap() {
  this.map = L.mapbox.map('map')
    .setView([43.605, 3.88], 13);
};

MapFlow.prototype._initializeQuadtree = function _initializeQuadtree() {
  var bounds = fixedQuadtreeBounds();
  var quadtree = this.quadtree = new MapQuadtree(bounds, 1);

  this.velomagg.on('add', function (model) {
    quadtree.addItem(model);
  });
};

function fixedQuadtreeBounds() {
  return new BoundingBox(3.704, 43.523, 4.056, 43.686);
}

MapFlow.prototype._createLayer = function _createLayer() {
  var mapElement = React.createElement(VeloMap, {
    quadtree: this.quadtree,
    map: this.map,
    config: this.config
  });
  React.render(mapElement, document.getElementById('map-component'));
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
