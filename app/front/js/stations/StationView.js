/* jslint node: true */
"use strict";

var Backbone = require('backbone');
var renderItem = require('./item.hbs');

var StationView = Backbone.View.extend({
  tagName: 'tr',
  className: 'station',
  initialize: function () {
    this.render();
    this.listenTo(this.model, 'change', this.render);
  },
  render: function render() {
    var station = this.model.toJSON();
    this.$el.html(renderItem(station));

    if (station.data.available_bikes === 0) {
      this.$el.addClass('danger')
    } else {
      this.$el.removeClass('danger')
    }

    if (this.model.changed.data) {
      this.$el.addClass('changed');
      clearTimeout(this.timeout);
      this.timeout = setTimeout(function () {
        this.$el.removeClass('changed');
      }.bind(this), 5000);
    }
  }
});

module.exports = StationView;