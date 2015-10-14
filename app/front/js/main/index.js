"use strict";

var config = require('../../../../config/public.json');
require('mapbox.js');
var L = window.L;
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;

var MapFlow = require('./MapFlow');
var PositionFlow = require('./PositionFlow');

L.mapbox.accessToken = 'pk.eyJ1IjoiZnJhbmNrZXJuZXdlaW4iLCJhIjoiYXJLM0dISSJ9.mod0ppb2kjzuMy8j1pl0Bw';
L.mapbox.config.FORCE_HTTPS = true;
L.mapbox.config.HTTPS_URL = 'https://api.tiles.mapbox.com/v4';

(function (config) {
  var map_flow = new MapFlow(config);
  map_flow.setUp();

  var position_flow = new PositionFlow(map_flow.map, map_flow.velomagg);
  position_flow.setUp();
})(config);
