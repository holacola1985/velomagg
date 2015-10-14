/* jslint node: true */
"use strict";

var ItemBackboneModel = require('lightstream-backbone').ItemBackboneModel;
var Backbone = require('backbone');

var VelomaggStation = ItemBackboneModel.extend({
  latitude: function () {
    return this.coordinates()[0];
  },
  longitude: function () {
    return this.coordinates()[1];
  },
  hash: function () {
    return this.cid;
  }
});

var VelomaggCollection = Backbone.Collection.extend({
  model: VelomaggStation
});

module.exports = VelomaggCollection;