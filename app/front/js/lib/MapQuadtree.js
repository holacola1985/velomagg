/* jslint node: true */
"use strict";

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');
var BoundingBox = require('./BoundingBox');

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
  if (!this._isInBounds(item.longitude(), item.latitude())) {
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

Node.prototype._isInBounds = function _isInBounds(longitude, latitude) {
  return this._bounds.isInBounds(longitude, latitude);
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
  var middle_point = this._bounds.middlePoint();
  this._nodes = {
    NW: this._newChildNode(new BoundingBox(
      this._bounds.south_west.longitude,
      middle_point.latitude,
      middle_point.longitude,
      this._bounds.north_east.latitude)),
    NE: this._newChildNode(new BoundingBox(
      middle_point.longitude,
      middle_point.latitude,
      this._bounds.north_east.longitude,
      this._bounds.north_east.latitude)),
    SE: this._newChildNode(new BoundingBox(
      middle_point.longitude,
      this._bounds.south_west.latitude,
      this._bounds.north_east.longitude,
      middle_point.latitude)),
    SW: this._newChildNode(new BoundingBox(
      this._bounds.south_west.longitude,
      this._bounds.south_west.latitude,
      middle_point.longitude,
      middle_point.latitude))
  };
};

Node.prototype._newChildNode = function _newChildNode(bounds) {
  return new Node(bounds, this._node_capacity, this._depth + 1, this._max_depth);
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

Node.prototype.reduce = function reduce(search_bounds, max_depth) {
  if (!this._bounds.intersects(search_bounds)) {
    return [];
  }

  if (this._isLeaf()) {
    if (this._isEmpty()) {
      return [];
    }

    return [this._items];
  }

  return this._reduceChildNodesItems(search_bounds, max_depth);
};

Node.prototype._reduceChildNodesItems = function _reduceChildNodesItems(search_bounds, max_depth) {
  var items = this._nodes.NW.reduce(search_bounds, max_depth)
    .concat(this._nodes.NE.reduce(search_bounds, max_depth))
    .concat(this._nodes.SE.reduce(search_bounds, max_depth))
    .concat(this._nodes.SW.reduce(search_bounds, max_depth));

  if (max_depth && this._depth >= max_depth) {
    return [_.flatten(items)];
  }
  return items;
};

Node.prototype._isEmpty = function _isEmpty() {
  if (this._isLeaf()) {
    return this._items.length === 0;
  }

  return this._nodes.NW._isEmpty() &&
      this._nodes.NE._isEmpty() &&
      this._nodes.SE._isEmpty() &&
      this._nodes.SW._isEmpty();
};

Node.prototype.toString = function toString(cardinal) {
  var text = '';
  for (var i = 1; i < this._depth; i++) {
    text += '\t';
  }
  text += (cardinal || 'R') + ': ';

  if (this._isLeaf()) {
    return text + '[' + this._items.length + ']' + this._items.map(function (item) {
        return item.hash();
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

MapQuadtree.prototype.reduce = function reduce(search_bounds, max_depth) {
  return this.rootNode().reduce(search_bounds, max_depth);
};

MapQuadtree.prototype.toString = function toString() {
  return this._root_node.toString();
};

module.exports = MapQuadtree;