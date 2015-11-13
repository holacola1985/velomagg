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
  update: function (stations) {
    this._render(stations);
  },
  _render: function (closest_stations) {
    closest_stations.bikes_style = 'color: ' + this.options.colors.bikes;
    closest_stations.slots_style = 'color: ' + this.options.colors.slots;
    closest_stations.closest_bike = this.options.i18n.t('control.closest_bike');
    closest_stations.no_bike = this.options.i18n.t('control.no_bike');
    closest_stations.closest_slot = this.options.i18n.t('control.closest_slot');
    closest_stations.no_slot = this.options.i18n.t('control.no_slot');
    if (closest_stations.closest_available_bike.walking) {
      closest_stations.closest_available_bike.walking.formatted_duration =
        this._formatDuration(closest_stations.closest_available_bike.walking.duration);
    }
    if (closest_stations.closest_free_slot.cycling) {
      closest_stations.closest_free_slot.cycling.formatted_duration =
        this._formatDuration(closest_stations.closest_free_slot.cycling.duration);
    }
    this.container.innerHTML = renderControl(closest_stations);
  },
  _formatDuration: function (duration) {
    var seconds = duration % 60;
    var minutes = (duration - seconds) / 60 % 60;
    var hours = Math.floor(duration / 3600);

    var formatted_duration = this.options.i18n.t('control.seconds', { seconds: seconds });
    if (minutes) {
      formatted_duration = this.options.i18n.t('control.minutes', { minutes: minutes }) + formatted_duration;
    }
    if (hours) {
      formatted_duration = this.options.i18n.t('control.hours', { hours: hours }) + formatted_duration;
    }

    return formatted_duration;
  }
});

module.exports = ClosestStationsControl;