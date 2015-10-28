'use strict';
var https = require('https');
var querystring = require('querystring');
var request = require('request');
var _ = require('lodash');
var Backbone = require('backbone');
var config = require('../../config');
var titleCase = require('./lib/title_case');

Backbone.ajax = getData;

var jcd_url = 'https://api.jcdecaux.com/vls/v1/stations/';
jcd_url += '?' + querystring.stringify({
  contract: config.jcdecaux.contract,
  apiKey: config.jcdecaux.api_key
});

var lightstream_url = 'http://127.0.0.1:';
lightstream_url += config.api.port;
lightstream_url += '/api/items/' + _.keys(config.elasticsearch.types)[0];
lightstream_url += '?api_key=' + config.api.key;
var Station = Backbone.Model.extend({
  idAttribute: 'number',
  parse: parse
});

var Stations = Backbone.Collection.extend({
  model: Station,
  url: jcd_url
});

function parse(item) {
  delete item.last_update;
  return item;
}

function getData(options) {
  request.get(options.url, function(error, req) {
    if(!error){
      options.success(JSON.parse(req.body));
    }else{
      console.log(error);
    }
  });
}

function saveData(model) {
  var raw = model.toJSON();
  var data = {
    item: {
      data: {
        name: titleCase(raw.name),
        available_bikes: raw.available_bikes,
        free_slots: raw.available_bike_stands,
        total: raw.bike_stands
      },
      id: model.id,
      geojson: {
        type: 'Point',
        coordinates: [raw.position.lng, raw.position.lat]
      }
    }
  };

  request.post({
    url: lightstream_url,
    body: data,
    json: true
  });
}

var stations = new Stations();
stations.on('add change', saveData);
stations.fetch();
setInterval(stations.fetch.bind(stations), 5000);
