'use strict';
import querystring from 'querystring';
import React from 'react';
import _ from 'lodash';
import { Map, Layer, MapboxLayer, Marker, Popup } from 'mapbox-react';
import Circle from './Circle.jsx';
import Notif from './Notif.jsx';

class VeloMap extends React.Component {

  static propTypes = {
    collection: React.PropTypes.any,
    map: React.PropTypes.any
  }


  constructor(props) {
    super(props);
    this.onAddRemove = _.throttle(() => {
      this.setState({
        collection: props.collection.toJSON()
      });
    }, 50);
    this.props.collection.on('change add remove', this.onAddRemove);
  }

  state = {
    collection: this.props.collection.toJSON(),
    mapboxLayer: 'mapbox.' + (querystring.parse(document.location.search.replace('?', '')).map || 'light')
  };

  componentWillUnmount() {
    this.props.collection.off('add remove', this.onAddRemove);
  }


  render() {
    return <Map map={this.props.map}>
      <MapboxLayer url={this.state.mapboxLayer}/>
      <Layer interactive>
        {this.props.collection.map((model) => {
          let data = model.get('data');
          return <Marker key={model.id} geojson={model.get('geojson')}>
            <div className="station-marker">
              <Circle value={data.available_bikes} total={data.total} />
              <div className="text">{data.available_bikes}/{data.total}</div>
              <Notif model={model} />
            </div>
            <Popup className="station-popup" offset={[0, -20]}>
              <h3>{data.name}</h3>
              <ul>
                <li className="available-bikes">{data.available_bikes} vélo(s) disponible(s)</li>
                <li className="free-slots">{data.free_slots} place(s) libre(s)</li>
                <li className="total">{data.total} place(s) au total</li>
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
