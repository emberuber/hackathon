/* global window */
import React, {Component} from 'react';
import DeckGL, {HexagonLayer, ScatterplotLayer, LineLayer} from 'deck.gl';

const LIGHT_SETTINGS = {
  lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const strokeWidth = 12

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

function getRouteColor(){
    return [43, 191, 203, 400]; 
}


export default class CollisionsOverlay extends Component {

  static get defaultColorRange() {
    return colorRange;
  }

  static get defaultViewport() {
    return {
      latitude: 42.3601,
      longitude: -71.0589,
      zoom: 13,
      minZoom: 5,
      maxZoom: 15,
      pitch: 40.5,
      bearing: -27.396674584323023
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
    const {viewport, data, radius, coverage, upperPercentile, routesData, directions} = this.props;

    if (!data) {
      return null;
    }

    const layers = [
      new HexagonLayer({
        id: 'collisions',
        colorRange,
        coverage,
        data,
        elevationRange: [0, 3000],
        elevationScale: this.state.elevationScale,
        extruded: true,
        getPosition: d => d.coordinates,
        lightSettings: LIGHT_SETTINGS,
        onHover: this.props.onHover,
        opacity: 1,
        pickable: Boolean(this.props.onHover),
        radius,
        upperPercentile
      }),
      // new LineLayer({
      //   id: 'directions',
      //   data: directions,
      //   strokeWidth,
      //   fp64: false,
      //   getSourcePosition: d => d.start,
      //   getTargetPosition: d => d.end,
      //   getColor: d => getRouteColor(),
      //   pickable: Boolean(this.props.onHover),
      //   onHover: this.props.onHover
      // })
    ];

    return <DeckGL {...viewport} layers={layers} onWebGLInitialized={this._initialize} />;
  }
}

CollisionsOverlay.displayName = 'CollisionsOverlay';
CollisionsOverlay.defaultProps = defaultProps;
