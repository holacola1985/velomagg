/* jslint node: true */
"use strict";

var Backbone = require('backbone');
var Station = require('lightstream-backbone').ItemBackboneModel;

var Velomagg = Backbone.Collection.extend({
  model: Station,
  comparator: function sortOrder(station) {
    return -station.toJSON().data.available_bikes;
  }
});

module.exports = Velomagg;