'use strict';

import React from 'react';
import Rx from 'rx';

let notif_id = 0;

class Notif extends React.Component {

  static propTypes = {
    model: React.PropTypes.any,
    colors: React.PropTypes.any
  };

  constructor(props) {
    super(props);
    this.timeout = [];
    this._onChange = this.onChange.bind(this);

    this.subscription =
      Rx.Observable.fromEvent(this.props.model, 'change')
        .map(station => station.bikesChange())
        .windowWithTime(1000)
        .flatMap(buffer => buffer.sum())
        .subscribe(this._onChange);
  }

  state = {
    notifs: []
  };

  componentWillUnmount() {
    this.subscription.dispose();
    this.timeout.forEach((timer) => {
      clearTimeout(timer);
    });
  }

  onChange(diff) {
    if (!diff) {
      return;
    }

    notif_id++;
    this.setState({
      notifs: this.state.notifs.concat([{
        id: 'notif_' + notif_id,
        diff: diff
      }])
    });
    this.timeout.push(setTimeout(() => {
      this.setState({
        notifs: this.state.notifs.slice(1, this.state.notifs.length)
      });
    }, 4000));
  }

  render() {
    return <div>
      {this.state.notifs.map((notif) => {
        let css = notif.diff > 0 ? 'in' : 'out';
        let sign = notif.diff > 0 ? '+' : '-';
        let color = notif.diff > 0 ? this.props.colors.bikes : this.props.colors.slots;
        let style = {
          backgroundColor: color,
          border: '1px solid ' + color
        };
        return <div className={css} key={notif.id}>
          <span className="change" style={style}>
            <span className="count">
              {sign + Math.abs(notif.diff) + ' '}
            </span>
            <span className="bike fa fa-bicycle" />
          </span>
        </div>;
      })}
    </div>;
  }

}

export default Notif;
