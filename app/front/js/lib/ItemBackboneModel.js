/* jslint node: true */
"use strict";

var Backbone = require('backbone');

var ItemBackboneModel = Backbone.Model.extend({
  coordinates: function coordinates() {
    return [this.get('geojson').coordinates[1], this.get('geojson').coordinates[0]];
  },
  longitude: function longitude() {
    if (this.coordinates()) {
      return this.coordinates()[0];
    }
  },
  latitude: function latitude() {
    if (this.coordinates()) {
      return this.coordinates()[1];
    }
  },
  _data: function _data() {
    return this.get('data');
  }
});

module.exports = ItemBackboneModel;