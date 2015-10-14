import React from 'react';

let notif_id = 0;

class Notif extends React.Component {

  static propTypes = {
    model: React.PropTypes.any    
  }

  constructor(props) {
    super(props);
    this.timeout = [];
    this.props.model.on('change', this.onChange.bind(this));
  }

  state = {
    notifs: []
  }

  componentWillUnmount() {
    this.props.model.on('change', this.onChange.bind(this));
    this.timeout.forEach((timer) => {
      clearTimeout(timer);
    });
  }

  onChange(diff) {
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
        return <div className={css} key={notif.id}>
          <span className="change">
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

export
default Notif;
