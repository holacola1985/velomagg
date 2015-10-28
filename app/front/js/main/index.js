'use strict';

var config = require('../../../../config/public.json');
window.config = config;
var L = require('mapbox.js');
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Polyglot = require('node-polyglot');

var MapFlow = require('./MapFlow');
var PositionFlow = require('./PositionFlow');
var tween = require('tween.js');
var raf = require('raf');

raf(function tick(time) {
  tween.update(time);
  raf(tick);
});

L.mapbox.accessToken = 'pk.eyJ1IjoiZnJhbmNrZXJuZXdlaW4iLCJhIjoiYXJLM0dISSJ9.mod0ppb2kjzuMy8j1pl0Bw';
L.mapbox.config.FORCE_HTTPS = true;
L.mapbox.config.HTTPS_URL = 'https://api.tiles.mapbox.com/v4';

(function(config) {
  $.ajax({
    url: "http://ajaxhttpheaders.appspot.com",
    dataType: 'jsonp'
  }).done(function (headers) {
    var language = headers['Accept-Language'];
    var locale = defineLocale(language);
    setMap(locale);
  }).fail(function (error) {
    let language = window.navigator.userLanguage || window.navigator.language;
    var locale = defineLocale(language);
    setMap(locale);
  });

  function defineLocale(language) {
    let locale = language.substr(0, 2);
    return /(en|fr)/g.test(locale) ? locale : 'fr';
  }

  function setMap(locale) {
    let polyglot = new Polyglot({locale : locale});

    $.getJSON('i18n/' + locale + '.json')
      .done(function (translations) {
        polyglot.extend(translations);

        let map_flow = new MapFlow(config, polyglot);
        map_flow.setUp();

        let position_flow = new PositionFlow(config, map_flow.map, map_flow.velomagg, polyglot);
        position_flow.setUp();
      });
  }

})(config);
