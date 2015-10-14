/* jslint node: true */
"use strict";

var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Node(bounds, node_capacity, depth, max_depth) {
  EventEmitter.call(this);

  this._items = [];
  this._nodes = {};
  this._bounds = bounds;
  this._node_capacity = node_capacity;
  this._depth = depth;
  this._max_depth = max_depth;
}

util.inherits(Node, EventEmitter);

Node.prototype.addItem = function addItem(item) {
  if (!this._isInBounds(item)) {
    return false;
  }

  if (this._didNotReachCapacity()) {
    this._items.push(item);
  } else {
    this._breakDownItemToChildNodes(item);
  }
  this.emit('changed');
  return true;
};

Node.prototype._isInBounds = function _isInBounds(item) {
  var is_greater_than_sw_longitude = item.longitude() >= this._bounds.south_west.longitude;
  var is_lower_than_ne_longitude = item.longitude() < this._bounds.north_east.longitude;

  var is_longitude_in_bounds =
    this._bounds.north_east.longitude > this._bounds.south_west.longitude ?
      is_greater_than_sw_longitude && is_lower_than_ne_longitude :
      is_greater_than_sw_longitude || is_lower_than_ne_longitude;

    return item.latitude() >= this._bounds.south_west.latitude &&
      item.latitude() < this._bounds.north_east.latitude &&
      is_longitude_in_bounds;
};

Node.prototype._didNotReachCapacity = function _didNotReachCapacity() {
  return this._isLeaf() &&
    (this._items.length !== this._node_capacity ||
    this._depth === this._max_depth);
};

Node.prototype.items = function items() {
  return this._items;
};

Node.prototype._breakDownItemToChildNodes = function _breakDownItemToChildNodes(item) {
  if (this._isLeaf()) {
    this._split();
  }

  this._addItemToChildNodes(item);
};

Node.prototype._addItemToChildNodes = function _addItemToChildNodes(item) {
  this._nodes.NW.addItem(item);
  this._nodes.NE.addItem(item);
  this._nodes.SE.addItem(item);
  this._nodes.SW.addItem(item);
};

Node.prototype._split = function _split() {
  this._createNodes();
  this._breakDownCurrentItems();
};

Node.prototype._createNodes = function _createNodes() {
  var middle_point = this._middlePoint();
  this._nodes = {
    NW: new Node({
      south_west: {latitude: middle_point.latitude, longitude: this._bounds.south_west.longitude},
      north_east: {latitude: this._bounds.north_east.latitude, longitude: middle_point.longitude}
    }, this._node_capacity, this._depth + 1, this._max_depth),
    NE: new Node({
      south_west: {latitude: middle_point.latitude, longitude: middle_point.longitude},
      north_east: {latitude: this._bounds.north_east.latitude, longitude: this._bounds.north_east.longitude}
    }, this._node_capacity, this._depth + 1, this._max_depth),
    SE: new Node({
      south_west: {latitude: this._bounds.south_west.latitude, longitude: middle_point.longitude},
      north_east: {latitude: middle_point.latitude, longitude: this._bounds.north_east.longitude}
    }, this._node_capacity, this._depth + 1, this._max_depth),
    SW: new Node({
      south_west: {latitude: this._bounds.south_west.latitude, longitude: this._bounds.south_west.longitude},
      north_east: {latitude: middle_point.latitude, longitude: middle_point.longitude}
    }, this._node_capacity, this._depth + 1, this._max_depth)
  };
};
Node.prototype._middlePoint = function _middlePoint() {
  var middle_point = {};
  middle_point.latitude = (this._bounds.north_east.latitude + this._bounds.south_west.latitude) / 2;

  var longitude_offset = this._longitudeOffset();
  middle_point.longitude = longitude_offset + (this._bounds.north_east.longitude + this._bounds.south_west.longitude) / 2;

  return middle_point;
};

Node.prototype._longitudeOffset = function _longitudeOffset() {
  var longitude_offset = 0;
  if (this._bounds.north_east.longitude < this._bounds.south_west.longitude) {
    longitude_offset =
      Math.abs(this._bounds.north_east.longitude) < Math.abs(this._bounds.south_west.longitude) ?
        -180 : 180;
  }
  return longitude_offset;
};

Node.prototype._breakDownCurrentItems = function _breakDownCurrentItems() {
  this._items.forEach(this._addItemToChildNodes.bind(this));
  this._items.splice(0, this._items.length);
};

Node.prototype.node = function node(cardinal) {
  return this._nodes[cardinal];
};

Node.prototype._isLeaf = function _isLeaf() {
  return !this._nodes.SW;
};

Node.prototype.flatten = function flatten() {
  if (this._isLeaf()) {
    return this._depth === 1 ?
      this._items.map(function (item) {
        return [item];
      }) :
      [this._items];
  }

  var flattened = [];
  for (var node in this._nodes) {
    if (!this._nodes[node]._isEmpty()) {
      flattened = flattened.concat(this._nodes[node].flatten());
    }
  }
  return flattened;
};

Node.prototype._isEmpty = function _isEmpty() {
  return (this._isLeaf() && this._items.length === 0) ||
    (!this._isLeaf() &&
      this._nodes.NW._isEmpty() &&
      this._nodes.NE._isEmpty() &&
      this._nodes.SE._isEmpty() &&
      this._nodes.SW._isEmpty());
};

Node.prototype.toString = function toString(cardinal) {
  var text = '';
  for (var i = 1; i < this._depth; i++) {
    text += '\t';
  }
  text += (cardinal || 'R') + ': ';

  if (this._isLeaf()) {
    return text + '[' + this._items.length + ']' + this._items.map(function (item) {
        return item.get('data').name;
      }).join() + '\n';
  }

  return text + '\n' +
    this._nodes.NW.toString('NW') +
    this._nodes.NE.toString('NE') +
    this._nodes.SE.toString('SE') +
    this._nodes.SW.toString('SW');
};



function MapQuadtree(bounds, node_capacity, max_depth) {
  EventEmitter.call(this);

  this._items = {};
  this._node_capacity = node_capacity || 4;
  this._max_depth = max_depth;
  this._initializeRootNode(bounds);
}

util.inherits(MapQuadtree, EventEmitter);

MapQuadtree.prototype._initializeRootNode = function _initializeRootNode(bounds) {
  this._root_node = new Node(bounds, this._node_capacity, 1, this._max_depth);
  this._root_node.on('changed', function () {
    this.emit('changed');
  }.bind(this));
};

MapQuadtree.prototype.addItem = function addItem(item) {
  if (this._items[item.hash()]) {
    return;
  }

  if (this.rootNode().addItem(item)) {
    this._items[item.hash()] = item;
  }
};

MapQuadtree.prototype.rootNode = function rootNode() {
  return this._root_node;
};

MapQuadtree.prototype.flatten = function flatten() {
  return this.rootNode().flatten();
};

MapQuadtree.prototype.move = function move(new_bounds) {
  this._initializeRootNode(new_bounds);
  Object.keys(this._items).forEach(function (hash) {
    this.rootNode().addItem(this._items[hash]);
  }.bind(this));
};

MapQuadtree.prototype.toString = function toString() {
  return this._root_node.toString();
};

module.exports = MapQuadtree;