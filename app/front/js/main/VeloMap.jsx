'use strict';
import querystring from 'querystring';
import React from 'react';
import _ from 'lodash';
import { Map, Layer, MapboxLayer, Marker, Popup } from 'mapbox-react';
import Circle from './Circle.jsx';

class VeloMap extends React.Component {


  static propTypes = {
    collection: React.PropTypes.any,
    map: React.PropTypes.any
  };

  constructor(props) {
    super(props);
    this.onAddRemove = _.throttle(() => {
      this.setState({
        collection: props.collection.toJSON()
      });
    }, 50);
    this.onChange = () => {
      console.log('change');
      this.setState({
        collection: props.collection.toJSON()
      });
    };
    this.props.collection.on('add remove', this.onAddRemove);
    this.props.collection.on('change', this.onChange);
  }

  state = {
    collection: this.props.collection.toJSON(),
    mapboxLayer: 'mapbox.' + (querystring.parse(document.location.search.replace('?', '')).map || 'light')
  };

  componentWillUnmount() {
    this.props.collection.off('add remove', this.onAddRemove);
    this.props.collection.off('change', this.onChange);
  }


  render() {
    return <Map map={this.props.map}>
      <MapboxLayer url={this.state.mapboxLayer}/>
      <Layer interactive>
        {this.state.collection.map((model) => {
          console.log(model.data.available_bikes, model.data.total);
          return <Marker key={model.id} geojson={model.geojson}>
            <div className="station-marker">
              <Circle value={model.data.available_bikes} total={model.data.total} />
              <div className="text">{model.data.available_bikes}/{model.data.total}</div>
            </div>
            <Popup className="station-popup" offset={[0, -20]}>
              <h3>{model.data.name}</h3>
              <ul>
                <li className="available-bikes">{model.data.available_bikes} vélo(s) disponible(s)</li>
                <li className="free-slots">{model.data.available_bikes} place(s) libre(s)</li>
                <li className="total">{model.data.total} place(s) au total</li>
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
