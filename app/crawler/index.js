/* jslint node: true */
"use strict";

var Promise = require('promise');
var get = Promise.denodeify(require('request').get);
var post = Promise.denodeify(require('request').post);
var xml2js = require('xml2js');
var iconv = require('iconv-lite');
var _ = require('lodash');
var global_config = require(process.cwd() + '/config');

var config = {
  lightstream_url: 'http://localhost:' + global_config.api.port + '/api/items/station?api_key=' + global_config.api.key,
  velomagg_url: global_config.crawler.velomagg_url
};

var parser = new xml2js.Parser();

var stations = {};
var fake = process.argv.reduce(function (exists, argument) {
  exists |= argument === '--fake';
  return exists;
}, false);


function fakeData(station) {
  if (fake && station.id === 18) {
    station.available_bikes = Math.round(Math.random() * station.total);
    station.free_slots = station.total - station.available_bikes;
    station.fake = true;
  }
}

function mapStation(si) {
  return {
    id: parseInt(si.$.id, 10),
    name: si.$.na.replace(/\d+ (.*)/g, '$1'),
    lat: parseFloat(si.$.la),
    lon: parseFloat(si.$.lg),
    available_bikes: parseInt(si.$.av, 10),
    free_slots: parseInt(si.$.fr, 10),
    total: parseInt(si.$.to, 10),
    credit_card: si.$.cb && si.$.cb === '1',
    date: new Date().toISOString()
  };
}

function filterStation(station) {
  fakeData(station);
  return station.name && !_.isEqual(stations[station.id], station, function (value, other) {
    if (/\d{4}-\d{2}-\d{2}/g.test(value)) {
      return true;
    }
  });
}

function sendToLightstream(station) {
  var body = {
    item: {
      geojson: {
        type: 'Point',
        coordinates: [station.lon, station.lat]
      },
      data: station
    }
  };
  post({
    url: config.lightstream_url,
    body: body,
    json: true
  }).then(function (response) {
    if (response.statusCode !== 200) {
      throw new Error(response.statusCode + ' : ' + (response.body.message || 'unknown error'))
    }
    stations[station.id] = station;
    //console.log('station updated: ' + station.id);
  }).catch(function (error) {
    console.log(error);
  });
}

parser.addListener('end', function(result) {
  result.vcs.sl[0].si
    .map(mapStation)
    .filter(filterStation)
    .forEach(sendToLightstream);
});

setInterval(function () {
  //console.log('loading...');
  get({
    url: config.velomagg_url,
    encoding: null
  }).then(function (response) {
    //console.log('response loaded.');
    if (response.statusCode === 200) {
      parser.parseString(iconv.decode(response.body, 'win1252'));
    }
  });
}, 2000);
