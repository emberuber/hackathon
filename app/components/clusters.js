/* global window,document */
import React, {Component, PureComponent} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from '../overlays/deckgl-overlay.js';
import Select from 'react-select';
import {Button, FormControl, FormGroup, InputGroup} from 'react-bootstrap';
import {json as requestJson} from 'd3-request';
import ClustersOverlay from '../overlays/clusters-overlay.js'

// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiYW50aG9ueWVtYmVybGV5IiwiYSI6ImNqMWJvNzMwazBhbGMyd3Fxbmlhb3VycGgifQ.997zUWJQeWgUY5ERLL3GWg"; // eslint-disable-line
const strokeWidth = 12;
const yMargin = 25
const defaultZoom = 13


export default class Clusters extends PureComponent {


  //Initialization functions

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500
      },
      hasUserInput: false,
      startValue: "",
      x: null,
      y: null,
      hoveredNotification: null,
      dropdownValue: null,
      clusters: null

    };

    requestJson('../data/test-notifications.json', (error, response) => {
      if (!error) {
        this.setState({clusters: response});
      }
    });
  }


  //MARK: Start and Destination helper methods // currently zooms to coordinates location
  goButtonClicked(){
    console.log("call API!!")
    //Call API with default preferred route if no preferred route chosen
    let userInput = this.state.startValue;
    let coords = userInput.split(",")

    this.setState({ viewport: {...this.state.viewport,
      latitude: parseInt(coords[0]),
      longitude: parseInt(coords[1]),
      zoom: defaultZoom,
    }});

  }

  handleTextInputChange(e){
    if(e.target.id == "start"){
      this.setState({ startValue: e.target.value },this.getValidationState);
    }

  }

  getValidationState(){
    if(this.state.startValue.length > 0){
      this.setState({hasUserInput: true})
    }else{
      this.setState({hasUserInput: false})
    }
  }




  

  //MARK: Map Methods

  //Call back for when <App/> renders so we can find the size of the window to let the map take it over
  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  //Every time the window resizes this function is called so we resize the map as well
  _resize() {
    this._onChangeViewport({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  //Update the state every time the user changes the viewport i.e. they zoom, pan, etc.
  _onChangeViewport(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  //when the user hovers over a notification
  _onHoverNotification({x, y, object}) {
    this.setState({x, y, hoveredNotification: object});
  }



  //MARK: Render methods

  //Render the map and route overlays
  _renderMap() {
    const {viewport, clusters, dropdownValue} = this.state;

    let map = null;
    if (dropdownValue !== null) {
      map = <MapGL
          {...viewport}
          mapStyle="mapbox://styles/mapbox/dark-v9"
          perspectiveEnabled={true}
          onChangeViewport={this._onChangeViewport.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}>
          <ClustersOverlay viewport={viewport}
            notifications= {clusters}
            onHover= {this._onHoverNotification.bind(this)}
            />
        </MapGL>
    } else {
      map = <MapGL
          {...viewport}
          mapStyle="mapbox://styles/mapbox/dark-v9"
          perspectiveEnabled={true}
          onChangeViewport={this._onChangeViewport.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}>
          <ClustersOverlay viewport={viewport}
            notifications= {clusters}
            onHover= {this._onHoverNotification.bind(this)}
            />
        </MapGL>
    }
    return (
      map
    );
  }

  //Render the tip for when someone hovers over a point

  _renderToolTip(){
    const {x, y, hoveredNotification} = this.state;
    return hoveredNotification && (
      <div className="nodal-tooltip" style={{left: x, top: y + yMargin}} >
        {hoveredNotification.message}
      </div>
    );

  }


  //render search buttons

  _renderSearchButtons(){

    const hasUserInput = this.state.hasUserInput
    const startValue = this.state.startValue
    return (
       <div>
        <FormGroup>
          <InputGroup>
            <FormControl 
              id="start" 
              type="text" 
              placeholder="Clusters Address"
              onChange={this.handleTextInputChange.bind(this)}
              value= {startValue}
            />            
            <InputGroup.Button>
              <Button
                type="submit"
                disabled={!hasUserInput}
                onClick= {this.goButtonClicked.bind(this)}>Go</Button>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>
       </div>
    );
  }


 

  //Render the Root component
  render() {

    return (
      <div id="container">
        {/* <NodalNav /> */}
        <div id="map">
          {this._renderMap()}
          {this._renderToolTip()}
        </div>
        <div id="navigation-group">
          <div id="dropdown">
            {this._renderSearchButtons()}
          </div>
        </div>
      </div>
    );
  }
}
