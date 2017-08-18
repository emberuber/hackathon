import React, {Component} from 'react';

import DeckGL, {ScatterplotLayer, LineLayer, ArcLayer} from 'deck.gl';

const strokeWidth = 12;



function getSize(viewport) {
  let zoom = viewport.zoom;
  return -0.05714285714*zoom + 1.24285714286  
}

function getCurrentColor(){
  return [88, 158, 194, 255]
}

function getRouteColor(){

    return [0, 0, 0, 100]; 
}

//get color for the line layers
function getColor(notificationDescription){
    return [0, 0, 0, 255]
  
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
    const {viewport,  notifications, directions, currentLocation, arcs} = this.props;
    console.log(currentLocation)
    console.log(notifications)


    //idea: do scatterplot points for dotted line - interpolate between route distances
    const layers = [
      new ScatterplotLayer({
        id: 'notifications',
        data: notifications,
        radiusScale: 20,
        getPosition: d => d.coordinates,
        getColor: d => getColor(d.notificationDescription),
        getRadius: d => getSize(viewport),
        radiusMinPixels: 10,
        updateTriggers: {
          getRadius: viewport
        },
        pickable: true,
        onHover: this.props.onHover

      }),
      new ScatterplotLayer({
        id: 'currentLocation',
        data: currentLocation,
        radiusScale: 20,
        getPosition: d => d.coordinates,
        getColor: d => getCurrentColor(),
        getRadius: d => getSize(viewport),
        updateTriggers: {
          getRadius: viewport
        },
        pickable: true,
        onHover: this.props.onHover

      }),
      //todo is to change the data coming in
      new ArcLayer({
        id: 'arc',
        data: arcs,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: d => getRouteColor(),
        getTargetColor: d => getColor("goodbye"),
        strokeWidth
      })
    ];

    return (
      <DeckGL {...viewport} layers={ layers } onWebGLInitialized={this._initialize} />
    );
  }
}
