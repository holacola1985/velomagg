'use strict';
import React from 'react';
import _ from 'lodash';
import { Map, Layer, MapboxLayer, Marker, Popup } from 'mapbox-react';
import StationCluster from './StationCluster';
import Circle from './Circle.jsx';
import Notif from './Notif.jsx';

class VeloMap extends React.Component {

  static propTypes = {
    quadtree: React.PropTypes.any,
    map: React.PropTypes.any
  }


  constructor(props) {
    super(props);
    this.onAddRemove = _.throttle(() => {
      this.setState({
        list: this.formatQuadtree()
      });
    }, 50);
    this.props.quadtree.on('changed', this.onAddRemove);
  }

  state = {
    list: this.formatQuadtree()
  };

  componentWillUnmount() {
    this.props.quadtree.off('changed', this.onAddRemove);
  }

  formatQuadtree() {
    return this.props.quadtree.flatten().map((models) => {
      return new StationCluster(models);
    });
  }


  render() {
    return <Map map={this.props.map}>
      <MapboxLayer url="mapbox.emerald"/>
      <Layer interactive>
        {this.state.list.map((stationCluster) => {
          let key = stationCluster.cid;
          let coordinates = stationCluster.coordinates();
          let geojson = {
            type: 'Point',
            coordinates: [coordinates[1], coordinates[0]]
          };
          return <Marker key={key} geojson={geojson}>
            <div className="station-marker">
              <Circle value={stationCluster.availableBikes()} total={stationCluster.total()} />
              <div className="text">{stationCluster.availableBikes()}/{stationCluster.total()}</div>
              <Notif model={stationCluster} />
            </div>
            <Popup className="station-popup" offset={[0, -20]}>
              <h3>{stationCluster.name()}</h3>
              <ul>
                <li className="available-bikes">{stationCluster.availableBikes()} vélo(s) disponible(s)</li>
                <li className="free-slots">{stationCluster.freeSlots()} place(s) libre(s)</li>
                <li className="total">{stationCluster.total()} place(s) au total</li>
              </ul>
            </Popup>
          </Marker>;
        })}
      </Layer>
    </Map>;
  }
}

export
default VeloMap;
