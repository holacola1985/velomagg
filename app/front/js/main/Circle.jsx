'use strict';
import React from 'react';
import Indicator from './Indicator';

class Circle extends React.Component {
  static propTypes = {
    value: React.PropTypes.number,
    total: React.PropTypes.number
  }
  state = {
    value: this.props.value,
    total: this.props.total
  }
  componentDidMount(){
    let node = this.refs.canvas.getDOMNode();
    this.indicator = new Indicator(node);
    this.draw();
  }
  componentDidUpdate() {
    this.draw();
  }
  draw(){
    this.indicator.render(this.state.value / this.state.total);
  }
  render() {
    return <canvas ref="canvas" width="45" height="45" />;
  }
}

export
default Circle;
