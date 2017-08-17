import React, {Component} from 'react';

import DeckGL, {LineLayer, ScatterplotLayer} from 'deck.gl';

 

function getSize(viewport) {
  let zoom = viewport.zoom;
  return -0.05714285714*zoom + 1.24285714286  
}

//get color for the line layers
function getColor(color){
  if (color === "nodal"){
    return [43, 191, 203, 250]; 
  } else if (color === "red") {
    return [255, 0, 0, 250];
  }
   else if (color === "yellow") {
    return [255, 255, 0, 255];
  }
  else{
    return [255, 0, 0, 255]
  }
}



export default class RouteAnnotationsOverlay extends Component {

  static get defaultViewport() {
    return {
      latitude: 42.3601,
      longitude: -71.0589,
      zoom: 13,
    };
  }


  _initialize(gl) {
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE);
    gl.blendEquation(gl.FUNC_ADD);
  }

  render() {
    const {viewport, routes, strokeWidth} = this.props;

    if (!routes) {
      return null;
    }


    //idea: do scatterplot points for dotted line - interpolate between route distances
    const layers = [
      new LineLayer({
        id: 'annotation-routes',
        data: routes,
        strokeWidth,
        fp64: false,
        getSourcePosition: d => d.start,
        getTargetPosition: d => d.end,
        getColor: d => getColor(d.color),
        pickable: Boolean(this.props.onHover),
        onHover: this.props.onHover
      })
    ];

    return (
      <DeckGL {...viewport} layers={ layers } onWebGLInitialized={this._initialize} />
    );
  }
}
