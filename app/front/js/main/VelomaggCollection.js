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
  },
  bikesChange: function () {
    return this.data().available_bikes - this._previousAttributes.data.available_bikes;
  }
});

var VelomaggCollection = Backbone.Collection.extend({
  model: VelomaggStation
});

module.exports = VelomaggCollection;