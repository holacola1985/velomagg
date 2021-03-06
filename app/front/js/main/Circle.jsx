'use strict';
import React from 'react';
import Indicator from './Indicator';
import tween from 'tween.js';

class Circle extends React.Component {
  static propTypes = {
    value: React.PropTypes.number,
    total: React.PropTypes.number,
    colors: React.PropTypes.any
  };
  componentDidMount() {
    let node = this.refs.canvas;
    this.indicator = new Indicator(node, this.props.colors.bikes);
    this._state = {
      percent: this.props.value / this.props.total
    };
    this.tween = new tween.Tween(this._state);
    this.tween.onUpdate(this.draw.bind(this));
    this.draw();
  }
  componentDidUpdate() {
    this.tween.stop();
    this.tween.to({
      percent: this.props.value / this.props.total
    }, 250);
    this.tween.start();
  }
  draw() {
    this.indicator.render(this._state.percent);
  }
  circleStyle() {
    return {
      backgroundColor: this.props.colors.slots
    }
  }
  render() {
    return <div className="circle" style={this.circleStyle()}>
      <canvas ref="canvas" width="46" height="46" />
    </div>;
  }
}

export default Circle;
