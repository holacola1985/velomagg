'use strict';

import React from 'react';
import Circle from './Circle.jsx';
import Notif from './Notif.jsx';

class StationMarker extends React.Component {

  static propTypes = {
    station: React.PropTypes.any,
    map: React.PropTypes.any
  };

  constructor(props) {
    super(props);
    this._onChange = () => {
      this.setState({
        station: this.props.station
      });
    };
    this.props.station.on('change', this._onChange);
  }

  state = {
    station: this.props.station
  };

  componentWillUnmount() {
    this.props.station.off('change', this._onChange);
  }

  textStyle(station) {
    if (station.total() >= 100) {
      return { fontSize: 14 };
    }

    return {};
  }

  text(station) {
    if (station.total() >= 100) {
      return station.availableBikes();
    }

    return station.availableBikes() + '/' + station.total();
  }

  render() {
    let station = this.state.station;

    return <div className="station-marker">
      <Circle value={station.availableBikes()} total={station.total()} />
      <div className="text" style={this.textStyle(station)}>{this.text(station)}</div>
      <Notif model={station} />
    </div>;
  }
}

export default StationMarker;
