/* jslint node: true */
/* jslint expr: true */
/*global describe, it, before, beforeEach, after, afterEach */
"use strict";

var chai = require('chai');
var should = chai.should();

var MapQuadtree = require('../../../app/front/js/lib/MapQuadtree');
var BoundingBox = require('../../../app/front/js/lib/BoundingBox');

describe('MapQuadtree behavior', function () {
  var quadtree;

  beforeEach(function () {
    var bounds = new BoundingBox(3, 43, 5, 44);
    quadtree = new MapQuadtree(bounds, 4);
  });

  function new_item(coordinates, hash) {
    hash = hash || Math.floor(Math.random() * 1000000).toString(16);
    return {
      longitude: function () {
        return coordinates[0];
      },
      latitude: function () {
        return coordinates[1];
      },
      hash: function () {
        return hash;
      },
      toString: function () {
        return hash;
      }
    }
  }

  describe('Build quadtree', function () {
    it('should add an item to the quadtree when in bounds', function () {
      quadtree.addItem(new_item([3.887, 43.608]));
  
      quadtree.rootNode().items().should.have.length(1);
    });
  
    it('should not add an item to the quadtree when out of bounds', function () {
      quadtree.addItem(new_item([-77.657, 43.520]));
  
      quadtree.rootNode().items().should.be.empty;
    });
  
    it('should not add an item with no latitude and longitude methods', function () {
      var item = { coordinates: [3.887, 43.608] };
      should.Throw(function () {
        quadtree.addItem(item);
      });
  
      quadtree.rootNode().items().should.be.empty;
    });
  
    it('should split node when max capacity is reached', function () {
      quadtree.addItem(new_item([3.887, 43.608])); // NW
      quadtree.addItem(new_item([3.314, 43.428])); // SW
      quadtree.addItem(new_item([3.667, 43.598])); // NW
      quadtree.addItem(new_item([4.457, 43.380])); // SE
      quadtree.addItem(new_item([4.239, 43.785])); // NE

      quadtree.rootNode().items().should.be.empty;
      quadtree.rootNode().node('NW').items().should.have.length(2);
      quadtree.rootNode().node('NE').items().should.have.length(1);
      quadtree.rootNode().node('SE').items().should.have.length(1);
      quadtree.rootNode().node('SW').items().should.have.length(1);
    });
  
    it('should continue to break items down after split', function () {
      quadtree.addItem(new_item([3.887, 43.608])); // NW
      quadtree.addItem(new_item([3.314, 43.428])); // SW
      quadtree.addItem(new_item([3.667, 43.598])); // NW
      quadtree.addItem(new_item([4.457, 43.380])); // SE
      quadtree.addItem(new_item([4.239, 43.785])); // NE
      quadtree.addItem(new_item([4.539, 43.848])); // NE

      quadtree.rootNode().items().should.be.empty;
      quadtree.rootNode().node('NW').items().should.have.length(2);
      quadtree.rootNode().node('NE').items().should.have.length(2);
      quadtree.rootNode().node('SE').items().should.have.length(1);
      quadtree.rootNode().node('SW').items().should.have.length(1);
    });
  
    it('should split node when max capacity is reached around point (0, 0)', function () {
      var bounds = new BoundingBox(-5.0, -45.0, 5.0, 45.0);
  
      quadtree = new MapQuadtree(bounds, 4);
  
      quadtree.addItem(new_item([-3.8, +43.61])); // NW
      quadtree.addItem(new_item([+3.3, -43.42])); // SE
      quadtree.addItem(new_item([-3.6, -43.59])); // SW
      quadtree.addItem(new_item([+4.4, +43.38])); // NE
      quadtree.addItem(new_item([+2.5, -23.65])); // SE
  
      quadtree.rootNode().items().should.be.empty;
      quadtree.rootNode().node('SW').items().should.have.length(1);
      quadtree.rootNode().node('NW').items().should.have.length(1);
      quadtree.rootNode().node('NE').items().should.have.length(1);
      quadtree.rootNode().node('SE').items().should.have.length(2);
    });
  
    it('should split node when max capacity is reached around longitude 180', function () {
      var bounds = new BoundingBox(178.0, 30.0, -175.0, 45.0);
  
      quadtree = new MapQuadtree(bounds, 4);
  
      quadtree.addItem(new_item([-176.887, 33.608])); // SE
      quadtree.addItem(new_item([+178.314, 43.428])); // NW
      quadtree.addItem(new_item([-178.467, 38.598])); // NW
      quadtree.addItem(new_item([+179.457, 36.380])); // SW
      quadtree.addItem(new_item([-178.667, 40.651])); // NE
  
      quadtree.rootNode().items().should.be.empty;
      quadtree.rootNode().node('SW').items().should.have.length(1);
      quadtree.rootNode().node('NW').items().should.have.length(2);
      quadtree.rootNode().node('NE').items().should.have.length(1);
      quadtree.rootNode().node('SE').items().should.have.length(1);
    });
  
    it('should limit quadtree depth', function () {
      var bounds = new BoundingBox(0.0, 0.0, 100.0, 60.0);
  
      quadtree = new MapQuadtree(bounds, 1, 3);
  
      quadtree.addItem(new_item([1.0, 12.0]));
      quadtree.addItem(new_item([18.0, 3.0]));
  
      quadtree.rootNode().items().should.be.empty;
      quadtree.rootNode().node('SW').items().should.be.empty;
      quadtree.rootNode().node('SW').node('SW').items().should.have.length(2);
    });
  
    it('should add item when on lower bounds', function () {
      var bounds = new BoundingBox(0.0, 0.0, 100.0, 60.0);
  
      quadtree = new MapQuadtree(bounds);
  
      quadtree.addItem(new_item([0.0, 0.0]));
  
      quadtree.rootNode().items().should.have.length(1);
    });
  
    it('should not add item when on upper bounds', function () {
      var bounds = new BoundingBox(0.0, 0.0, 100.0, 60.0);
  
      quadtree = new MapQuadtree(bounds);
  
      quadtree.addItem(new_item([100.0, 60.0]));
  
      quadtree.rootNode().items().should.be.empty;
    });
  
    it('should not add the same item twice', function () {
      var item = new_item([3.887, 43.608]);
      quadtree.addItem(item);
      quadtree.addItem(item);
  
      quadtree.rootNode().items().should.have.length(1);
    });
  
    it('should raise a changed event when quadtree change', function (done) {
      quadtree.on('changed', done);
  
      quadtree.addItem(new_item([3.887, 43.608]));
    });
  
    it('should raise a changed event with a deep quadtree', function (done) {
      quadtree.addItem(new_item([3.887, 43.608])); // NW
      quadtree.addItem(new_item([3.314, 43.428])); // SW
      quadtree.addItem(new_item([3.667, 43.598])); // SW
      quadtree.addItem(new_item([4.457, 43.380])); // SE
  
      quadtree.once('changed', done);
  
      quadtree.addItem(new_item([4.239, 43.785])); // NE
    });
  });

  describe('Query Quadtree', function () {
    it('should find an item in a quadtree with one item when search bounds are in quadtree', function () {
      quadtree.addItem(new_item([3.8, 43.4]));

      var search_bounds = new BoundingBox(3.7, 43.3, 3.9, 43.5);
      var items = quadtree.reduce(search_bounds);

      items.should.have.length(1);
    });

    it('should not find an item in a quadtree with one item when search bounds are out of the quadtree', function () {
      quadtree.addItem(new_item([3.8, 43.4]));

      var search_bounds = new BoundingBox(1.0, 10.0, 2.0, 11.0);
      var items = quadtree.reduce(search_bounds);

      items.should.have.length(0);
    });

    it('should find an item in a quadtree with one item when search bounds are partially in quadtree', function () {
      quadtree.addItem(new_item([3.8, 43.4]));

      var search_bounds = new BoundingBox(2.9, 42.9, 3.1, 43.1);
      var items = quadtree.reduce(search_bounds);

      items.should.have.length(1);
    });

    it('should find an item in a quadtree with one item when search bounds are around quadtree', function () {
      quadtree.addItem(new_item([3.8, 43.4]));

      var search_bounds = new BoundingBox(2.0, 42.0, 6.0, 45.0);
      var items = quadtree.reduce(search_bounds);

      items.should.have.length(1);
    });

    it('should find an item in a quadtree which bounds are around longitude 180', function () {
      var bounds = new BoundingBox(175.0, 30.0, -179.0, 45.0);
      quadtree = new MapQuadtree(bounds);

      quadtree.addItem(new_item([-179.8, 38.0]));

      var search_bounds = new BoundingBox(176.0, 35.0, 179.0, 44.0);
      var items = quadtree.reduce(search_bounds);

      items.should.have.length(1);
    });

    it('should find an item in a quadtree which bounds are around longitude 180 when search bounds are above longitude 180', function () {
      var bounds = new BoundingBox(175.0, 30.0, -176.0, 45.0);
      quadtree = new MapQuadtree(bounds);

      quadtree.addItem(new_item([-179.8, 38.0]));

      var search_bounds = new BoundingBox(-179.0, 35.0, -176.0, 44.0);
      var items = quadtree.reduce(search_bounds);

      items.should.have.length(1);
    });

    it('should find an item after quadtree split', function () {
      quadtree.addItem(new_item([3.887, 43.608])); // NW
      quadtree.addItem(new_item([3.314, 43.428])); // SW
      quadtree.addItem(new_item([3.667, 43.598])); // NW
      quadtree.addItem(new_item([4.457, 43.380])); // SE
      quadtree.addItem(new_item([4.239, 43.785])); // NE

      var search_bounds = new BoundingBox(3.7, 43.3, 3.9, 43.6);
      var items = quadtree.reduce(search_bounds);

      items.should.have.length(2);
      items[0].should.have.length(2);
      items[1].should.have.length(1);
    });

    it('should not return node items ', function () {
      quadtree.addItem(new_item([3.887, 43.608])); // NW
      quadtree.addItem(new_item([4.314, 43.428])); // SE
      quadtree.addItem(new_item([3.667, 43.598])); // NW
      quadtree.addItem(new_item([4.457, 43.380])); // SE
      quadtree.addItem(new_item([4.239, 43.785])); // NE

      var search_bounds = new BoundingBox(3.7, 43.3, 3.9, 43.6);
      var items = quadtree.reduce(search_bounds);

      items.should.have.length(1);
    });

    it('should aggregate items when depth search limit is reached', function () {
      quadtree.addItem(new_item([3.887, 43.608])); // NW
      quadtree.addItem(new_item([3.314, 43.428])); // SW
      quadtree.addItem(new_item([3.667, 43.598])); // NW
      quadtree.addItem(new_item([4.457, 43.380])); // SE
      quadtree.addItem(new_item([4.239, 43.785])); // NE

      var search_bounds = new BoundingBox(3.7, 43.3, 3.9, 43.6);
      var items = quadtree.reduce(search_bounds, 1);

      items.should.have.length(1);
      items[0].should.have.length(3);
    });
  });
});