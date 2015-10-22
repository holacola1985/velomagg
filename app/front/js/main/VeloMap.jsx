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
    map: React.PropTypes.any,
    config: React.PropTypes.any,
    i18n: React.PropTypes.any
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

  popupStyle() {
    return { __html:
      `.station-popup .leaflet-popup-content-wrapper
      { background: url("../img/${this.props.config.popup.background_image}") no-repeat 0 0; }
      .station-popup h3
      { background: url("../img/${this.props.config.popup.logo}") no-repeat left center; }`
    };
  }

  render() {
    var dynamic_css = this.popupStyle();

    return <Map map={this.props.map}>
      <MapboxLayer url="mapbox.emerald"/>
      <Layer interactive>
        <style type="text/css" dangerouslySetInnerHTML={dynamic_css} />
        {
          this.state.list.map((stations) => {
            let key = stations.key();
            let coordinates = stations.coordinates();
            let geojson = {
              type: 'Point',
              coordinates: [coordinates[1], coordinates[0]]
            };
            let bikes_style = { color: this.props.config.colors.bikes };
            let slots_style = { color: this.props.config.colors.slots };
            let total_style = { color: this.props.config.colors.text };

            return <Marker key={key} geojson={geojson}>
              <StationMarker station={stations} colors={this.props.config.colors} />
              <Popup className="station-popup" offset={[0, -15]} colors={this.props.config.colors}>
                <h3>{stations.name()}</h3>
                <ul>
                  <li style={bikes_style}>{this.props.i18n.t('popup.available_bikes', stations.availableBikes())}</li>
                  <li style={slots_style}>{this.props.i18n.t('popup.free_slots', stations.freeSlots())}</li>
                  <li style={total_style}>{this.props.i18n.t('popup.total', stations.total())}</li>
                </ul>
              </Popup>
            </Marker>;})
        }
      </Layer>
    </Map>;
  }
}

export default VeloMap;
