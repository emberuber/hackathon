/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import HeatmapOverlay from '../overlays/heatmap-overlay.js';

import {csv as requestCsv} from 'd3-request';
import {json as requestJson} from 'd3-request';


// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiYW50aG9ueWVtYmVybGV5IiwiYSI6ImNqMWJvNzMwazBhbGMyd3Fxbmlhb3VycGgifQ.997zUWJQeWgUY5ERLL3GWg"; 

export default class Heatmap extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...HeatmapOverlay.defaultViewport,
        width: 500,
        height: 500
      },
      data: null,
    };

    requestCsv('../data/illegal-pickups.csv', (error, response) => {
      if (!error) {
        const data = response.map(d => ([Number(d.lng), Number(d.lat)]));
        this.setState({data});
      }
    });

  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    this._onChangeViewport({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onChangeViewport(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}

    });
    console.log(viewport)
  }

  render() {
    const {viewport, data} = this.state;
    return (
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        perspectiveEnabled={true}
        onChangeViewport={this._onChangeViewport.bind(this)}
        mapboxApiAccessToken={MAPBOX_TOKEN}>
        <HeatmapOverlay
          viewport={viewport}
          data={data || []}
          radius={100}
          upperPercentile={90}
          coverage={1}
        />
      </MapGL>
    );
  }
}
