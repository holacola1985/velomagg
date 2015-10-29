'use strict';

import React from 'react';
import Circle from './Circle.jsx';
import Notif from './Notif.jsx';

class StationMarker extends React.Component {

  static propTypes = {
    station: React.PropTypes.any,
    map: React.PropTypes.any,
    colors: React.PropTypes.any
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

  componentWillUpdate() {
    this.props.station.off('change', this._onChange);
  }

  componentDidUpdate(){
    this.props.station.on('change', this._onChange);
  }

  componentWillUnmount() {
    this.props.station.off('change');
  }

  textStyle(station) {
    let style = {
      color: this.props.colors.text
    };
    if (station.total() >= 100) {
      style.fontSize = 14;
    }

    return style;
  }

  text(station) {
    if (station.total() >= 100) {
      return station.availableBikes();
    }

    return station.availableBikes() + '/' + station.total();
  }

  clusterStyle(station) {
    let cluster_style = station.isACluster() ? {} : { display: 'none' };
    cluster_style.border = '2px solid ' + this.props.colors.text;
    cluster_style.backgroundColor = this.props.colors.text;
    return cluster_style;
  }

  render() {
    let station = this.state.station;

    return <div className="station-marker">
      <Circle value={station.availableBikes()} total={station.total()} colors={this.props.colors} />
      <div className="text" style={this.textStyle(station)}>{this.text(station)}</div>
      <div className="cluster"><span style={this.clusterStyle(station)}>{station.clusterSize()}</span></div>
      <Notif model={station} colors={this.props.colors} />
    </div>;
  }
}

export default StationMarker;
