/* jslint node: true */
"use strict";

var L = window.L;
var renderControl = require('./control.hbs');

var ClosestStationsControl = L.Control.extend({
  options: {
    position: 'topright'
  },
  onAdd: function (map) {
    this.container = L.DomUtil.create('div', 'leaflet-control-command');
    return this.container;
  },
  update: function (stations, current_position) {
    var closest_stations = closestStations(stations, current_position);
    this._render({
      closest_available_bike: closest_stations.filter(function (station) {
        return station.data.available_bikes > 0;
      })[0],
      closest_free_slot: closest_stations.filter(function (station) {
        return station.data.free_slots > 0;
      })[0]
    });
  },
  _render: function (closest_stations) {
    this.container.innerHTML = renderControl(closest_stations);
  }
});

function closestStations(stations, current_position) {
  return stations.models.map(function (model) {
    var station = model.toJSON();
    return {
      data: station.data,
      distance: current_position.distanceTo(model.coordinates()).toFixed(0)
    };
  }).sort(function (a, b) {
    return a.distance - b.distance;
  });
}

module.exports = ClosestStationsControl;