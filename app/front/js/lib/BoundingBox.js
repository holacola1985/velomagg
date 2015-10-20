/* jslint node: true */
"use strict";

function Coordinates(longitude, latitude) {
  this.longitude = longitude;
  this.latitude = latitude;
}

Coordinates.prototype.applyOffset = function applyOffset(offset) {
  return this.longitude < 0 ? offset + this.longitude : this.longitude;
};

function BoundingBox(sw_lon, sw_lat, ne_lon, ne_lat) {
  this.south_west = new Coordinates(sw_lon, sw_lat);
  this.north_east = new Coordinates(ne_lon, ne_lat);
}

BoundingBox.prototype.isInBounds = function isInBounds(longitude, latitude) {
  var is_greater_than_sw_longitude = longitude >= this.south_west.longitude;
  var is_lower_than_ne_longitude = longitude < this.north_east.longitude;

  var is_longitude_in_bounds =
    this.isAcrossAntimeridian() ?
    is_greater_than_sw_longitude || is_lower_than_ne_longitude :
    is_greater_than_sw_longitude && is_lower_than_ne_longitude;

  return latitude >= this.south_west.latitude &&
    latitude < this.north_east.latitude &&
    is_longitude_in_bounds;
};

BoundingBox.prototype.middlePoint = function middlePoint() {
  return new Coordinates(
    this._longitudeOffset() + (this.north_east.longitude + this.south_west.longitude) / 2,
    (this.north_east.latitude + this.south_west.latitude) / 2);
};

BoundingBox.prototype._longitudeOffset = function _longitudeOffset() {
  if (this.isAcrossAntimeridian()) {
    return Math.abs(this.north_east.longitude) < Math.abs(this.south_west.longitude) ?
        -180 : 180;
  }
  return 0;
};

BoundingBox.prototype.isAcrossAntimeridian = function isAcrossAntimeridian() {
  return this.north_east.longitude < this.south_west.longitude;
};

BoundingBox.prototype.intersects = function intersect(boxB) {
  var offset =
    (this.isAcrossAntimeridian() || boxB.isAcrossAntimeridian()) ? 360 : 0;
  var boxA = this.shift(offset);
  boxB = boxB.shift(offset);

  var longitude_distance_between_centers =
    Math.abs(
      boxA.north_east.longitude +
      boxA.south_west.longitude -
      boxB.north_east.longitude -
      boxB.south_west.longitude);

  var latitude_distance_between_centers =
    Math.abs(
      boxA.north_east.latitude +
      boxA.south_west.latitude -
      boxB.north_east.latitude -
      boxB.south_west.latitude);

  var sum_of_width =
    boxA.north_east.longitude -
    boxA.south_west.longitude +
    boxB.north_east.longitude -
    boxB.south_west.longitude;

  var sum_of_height =
    boxA.north_east.latitude -
    boxA.south_west.latitude +
    boxB.north_east.latitude -
    boxB.south_west.latitude;

  return longitude_distance_between_centers <= sum_of_width &&
    latitude_distance_between_centers <= sum_of_height;
};

BoundingBox.prototype.shift = function shift(offset) {
  if (!offset) {
    return this;
  }

  var sw_lon = this.south_west.applyOffset(offset);
  var ne_lon = this.north_east.applyOffset(offset);
  return new BoundingBox(sw_lon, this.south_west.latitude, ne_lon, this.north_east.latitude);
};

BoundingBox.fromLeafletMap = function fromLeafletMap(map) {
  var bounds = map.getBounds();
  return new BoundingBox(
    bounds._southWest.lng,
    bounds._southWest.lat,
    bounds._northEast.lng,
    bounds._northEast.lat
  );
};

module.exports = BoundingBox;