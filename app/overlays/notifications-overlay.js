import React, {Component} from 'react';

import DeckGL, {ScatterplotLayer, LineLayer} from 'deck.gl';

const strokeWidth = 12;


function getSize(viewport) {
  let zoom = viewport.zoom;
  return -0.05714285714*zoom + 1.24285714286  
}

function getRouteColor(){
    return [43, 191, 203, 400]; 
}

//get color for the line layers
function getColor(notificationDescription){
    if (notificationDescription === "Watch out for pedestrians"){
      return [43, 191, 203, 255]
    } else {
      return [244, 69, 69, 255]
    }

}

function onHover(message){

}


export default class NotificationsOverlay extends Component {

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
    const {viewport,  notifications, directions} = this.props;

    if (!notifications) {
      return null;
    }


    //idea: do scatterplot points for dotted line - interpolate between route distances
    const layers = [
      new ScatterplotLayer({
        id: 'notifications',
        data: notifications,
        radiusScale: 20,
        getPosition: d => d.point.coordinates,
        getColor: d => getColor(d.notificationDescription),
        getRadius: d => getSize(viewport),
        radiusMinPixels: 10,
        updateTriggers: {
          getRadius: viewport
        },
        pickable: true,
        onHover: this.props.onHover

      }),
      //todo is to change the data coming in
      new LineLayer({
        id: 'directions',
        data: directions,
        strokeWidth,
        fp64: false,
        getSourcePosition: d => d.start,
        getTargetPosition: d => d.end,
        getColor: d => getRouteColor(),
        pickable: Boolean(this.props.onHover),
        onHover: this.props.onHover
      })
    ];

    return (
      <DeckGL {...viewport} layers={ layers } onWebGLInitialized={this._initialize} />
    );
  }
}
