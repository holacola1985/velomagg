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
        list: this.listClusters()
      });
    }, this);
  }

  state = {
    list: []
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
    let miniMarkers = [];
    let stationsMarkers = [];
    this.state.list.forEach((stations) => {
      let key = stations.key();
      let coordinates = stations.coordinates();
      let geojson = {
        type: 'Point',
        coordinates: [coordinates[1], coordinates[0]]
      };
      if(stations.isACluster()){
        stations.each(function(station){
          miniMarkers.push(<Marker key={station.id} geojson={station.get('geojson')}>
            <div className="mini-marker" />
          </Marker>);
        });
      }
      stationsMarkers.push(<Marker key={key} geojson={geojson}>
        <StationMarker station={stations} />
        <Popup className="station-popup" offset={[0, 3]}>
          <h3>{stations.name()}</h3>
          <ul>
            <li className="available-bikes">{stations.availableBikes()} vélo(s) disponible(s)</li>
            <li className="free-slots">{stations.freeSlots()} place(s) libre(s)</li>
            <li className="total">{stations.total()} place(s) au total</li>
          </ul>
        </Popup>
      </Marker>);
    });
    return <Map map={this.props.map}>
      <MapboxLayer url="mapbox.emerald"/>
      <Layer>
        {miniMarkers}
      </Layer>
      <Layer interactive>
        {stationsMarkers}
      </Layer>
    </Map>;
  }
}

export default VeloMap;
