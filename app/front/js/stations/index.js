var config = require('../../../../config/public.json');

var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Socket = require('lightstream-socket').Socket;
var Velomagg = require('./Velomagg');
var StationView = require('./StationView');

var velomagg;

var options = {
  max_retries: 2,
  retry_interval: 2000
};
var socket = new Socket('ws://' + config.hostname + '/socket/', 'station', options);
socket.on('opened', function () {
  velomagg = velomagg || initializeVelomagg(socket);
});

var reset = false;
var collection_options = {remove: false};

function initializeVelomagg(socket) {
  var velomagg = new Velomagg();
  velomagg.on('update', renderStations);

  socket.on('new_items', function (stations) {
    console.log('received: ' + stations.length);
    console.log(stations[0]);
    console.log(collection_options);
    velomagg.set(stations, collection_options);
    reset = false;
    collection_options.remove = false;
  });
  socket.listen();

  return velomagg;
}

function renderStations(station_models) {
  if (reset) {
    $('#list').html('');
  }

  station_models.forEach(function (station_model) {
    var view = new StationView({model: station_model});
    $('#list').append(view.$el);
  });
}

socket.on('error', function (error) {
  console.log('error in socket', error);
  velomagg = null;
});

socket.on('closed', function () {
  console.log('socket has been closed');
});

$('#search').on('submit', function (event) {
  event.preventDefault();

  collection_options.remove = true;
  reset = true;
  socket.changeFilter({
    name: this.q.value
  });
});

socket.connect();

