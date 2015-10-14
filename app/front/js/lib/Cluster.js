/* jslint node: true */
"use strict";

var Backbone = require('backbone');

var Cluster = Backbone.Model.extend({
  initialize: function () {
    Backbone.Model.prototype.initialize.apply(this, arguments);
    var items = this.toJSON();

    Object.keys(items).forEach(function (index) {
      items[index].on('change', function () {
        this.trigger('change', this.changedValues(items[index]));
      }, this);
    }.bind(this));
  },
  coordinates: function coordinates() {
    var items = this.toJSON();
    var latitude_total = 0;
    var longitude_total = 0;
    var count = 0;
    for (var index in items) {
      latitude_total += items[index].latitude();
      longitude_total += items[index].longitude();
      count++;
    }

    return [
      latitude_total / count,
      longitude_total / count
    ];
  },
  data: function () {
    var items = this.toJSON();
    return Object.keys(items).reduce(function (array, index) {
      array.push(items[index].data());
      return array;
    }, []);
  },
  changedValues: function (item) {}
});

module.exports = Cluster;