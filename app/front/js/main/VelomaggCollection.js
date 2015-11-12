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
  model: VelomaggStation,
  closestStations: function closestStations(current_position) {
    return this.models.map(function (model) {
      var station = model.toJSON();
      return {
        data: station.data,
        coordinates: model.coordinates(),
        distance: current_position.distanceTo(model.coordinates()).toFixed(0)
      };
    }).sort(function (a, b) {
      return a.distance - b.distance;
    });
  }
});

module.exports = VelomaggCollection;