'use strict';
import React from 'react';
import _ from 'lodash';
import { Map, Layer, MapboxLayer, Marker, Popup } from 'mapbox-react';
import StationCluster from './StationCluster';
import StationMarker from './StationMarker.jsx';
import BoundingBox from '../lib/BoundingBox';

class VeloMap extends React.Component {

  static propTypes = {
    quadtree: React.PropTypes.any,
    map: React.PropTypes.any
  };

  constructor(props) {
    super(props);
    this.onAddRemove = _.throttle(() => {
      this.setState({
        list: this.listClusters()
      });
    }, 50);
    this.props.quadtree.on('changed', this.onAddRemove);

    this.props.map.on('zoomend', function () {
      this.setState({
        list: this.listClusters(),
        zoom: this.props.map.getZoom()
      });
    }, this);
  }

  state = {
    list: [],
    zoom: this.props.map.getZoom()
  };

  componentWillUnmount() {
    this.props.quadtree.off('changed', this.onAddRemove);
  }

  listClusters() {
    var bounds = BoundingBox.fromLeafletMap(this.props.map);
    var depth_search = this.depthSearch();

    return this.props.quadtree.reduce(bounds, depth_search).map((models) => {
      return new StationCluster(models);
    });
  }

  depthSearch() {
    var zoom = this.props.map.getZoom();
    if (zoom < 12) {
      return 1;
    }
    return zoom - 8;
  }

  render() {
    return <Map map={this.props.map}>
      <MapboxLayer url="mapbox.emerald"/>
      <Layer interactive>
        <div>{this.state.zoom}</div>
        {this.state.list.map((station) => {
          let key = station.cid;
          let coordinates = station.coordinates();
          let geojson = {
            type: 'Point',
            coordinates: [coordinates[1], coordinates[0]]
          };
          return <Marker key={key} geojson={geojson}>
            <StationMarker station={station} />
            <Popup className="station-popup" offset={[0, 3]}>
              <h3>{station.name()}</h3>
              <ul>
                <li className="available-bikes">{station.availableBikes()} vélo(s) disponible(s)</li>
                <li className="free-slots">{station.freeSlots()} place(s) libre(s)</li>
                <li className="total">{station.total()} place(s) au total</li>
              </ul>
            </Popup>
          </Marker>;})}
      </Layer>
    </Map>;
  }
}

export default VeloMap;
