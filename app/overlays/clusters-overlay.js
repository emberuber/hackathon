import React, {Component} from 'react';

import DeckGL, {ScatterplotLayer} from 'deck.gl';

 

function getSize(size, viewport) {
  let zoom = viewport.zoom;
  return -0.05714285714*zoom + 1.24285714286  
}

//get color for the line layers
function getColor(notificationId){
    if (notificationId === "High Collision Density"){
      return [43, 191, 203, 255]
    } else if(notificationId === "Strange Shadows"){
      return [244, 69, 69, 255]
    }

}

function onHover(message){

}


export default class ClustersOverlay extends Component {

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
    const {viewport,  notifications} = this.props;

    if (!notifications) {
      return null;
    }


    //idea: do scatterplot points for dotted line - interpolate between route distances
    const layers = [
      new ScatterplotLayer({
        id: 'notifications',
        data: notifications,
        radiusScale: 20,
        getPosition: d => d.coordinates,
        getColor: d => getColor(d.notificationId),
        getRadius: d => getSize(d.size, viewport),
        radiusMinPixels: 10,
        updateTriggers: {
          getRadius: viewport
        },
        pickable: true,
        onHover: this.props.onHover

      })
    ];

    return (
      <DeckGL {...viewport} layers={ layers } onWebGLInitialized={this._initialize} />
    );
  }
}
