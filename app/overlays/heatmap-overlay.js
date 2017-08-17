/* global window */
import React, {Component} from 'react';
import DeckGL, {HexagonLayer, ScatterplotLayer} from 'deck.gl';

const LIGHT_SETTINGS = {
  lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

const elevationScale = {min: 1, max: 50};

const defaultProps = {
  radius: 1000,
  upperPercentile: 100,
  coverage: 1

};

function getSize(viewport) {
  let zoom = viewport.zoom;
  return -.253*zoom + 100  
}


export default class HeatmapOverlay extends Component {

  static get defaultColorRange() {
    return colorRange;
  }

  static get defaultViewport() {
    return {
      longitude: -122.40735498351242,
      latitude: 37.78248204719873,
      zoom: 12.655445367073334,
      minZoom: 5,
    };
  }

  constructor(props) {
    super(props);
    this.intervalTimer = null;
    this.state = {
      elevationScale: elevationScale.min
    };


  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.length !== this.props.data.length) {
    }
  }

  componentWillUnmount() {
  }


  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    const {viewport, data, radius, coverage, upperPercentile, routesData} = this.props;

    if (!data) {
      return null;
    }

    const layers = [
      new HexagonLayer({
        id: 'heatmap',
        colorRange,
        coverage,
        data,
        elevationRange: [0, 3000],
        elevationScale: this.state.elevationScale,
        extruded: false,
        getPosition: d => d,
        lightSettings: LIGHT_SETTINGS,
        onHover: this.props.onHover,
        opacity: 1,
        getRadius: d => getSize(viewport),
        updateTriggers: {
          getRadius: viewport
        },
        pickable: Boolean(this.props.onHover),
        upperPercentile
      })
    ];

    return <DeckGL {...viewport} layers={layers} onWebGLInitialized={this._initialize} />;
  }
}

HeatmapOverlay.displayName = 'HeatmapOverlay';
HeatmapOverlay.defaultProps = defaultProps;
