/* jslint node: true */
'use strict';

var Backbone = require('backbone');

var Cluster = Backbone.Collection.extend({
  key: function(){
    if(this.length > 1){
      return this.pluck('id').join('-');
    }else{
      return this.first().id;
    }
  },
  coordinates: function coordinates() {
    var latitude_total = 0;
    var longitude_total = 0;
    this.each(function(item){
      latitude_total += item.latitude();
      longitude_total += item.longitude();
    });
    return [
      latitude_total / this.length,
      longitude_total / this.length
    ];
  },
  data: function () {
    return this.pluck('data');
  },
  changedValues: function () {}
});

module.exports = Cluster;
