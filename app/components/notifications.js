/* global window,document */
import React, {Component, PureComponent} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from '../overlays/deckgl-overlay.js';
import Select from 'react-select';
import {Button, FormControl, FormGroup, InputGroup} from 'react-bootstrap';
import {json as requestJson} from 'd3-request';
import NotificationsOverlay from '../overlays/notifications-overlay.js'

// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiYW50aG9ueWVtYmVybGV5IiwiYSI6ImNqMWJvNzMwazBhbGMyd3Fxbmlhb3VycGgifQ.997zUWJQeWgUY5ERLL3GWg"; // eslint-disable-line
const strokeWidth = 12;
const yMargin = 25
const defaultZoom = 13
const baseURL = 'https://connect20-env.us-west-2.elasticbeanstalk.com:8443/v01/webapi/'
const cyclistRouteURL = 'notification/cyclist/route?'


export default class Notifications extends PureComponent {


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
      destinationValue: "",
      x: null,
      y: null,
      hoveredNotification: null,
      steps: null,
      startingCoords: null,
      finishCoords: null,
      directions: null

    };



  }


  //MARK: Start and Destination helper methods // currently zooms to coordinates location
  goButtonClicked(){
    this.fetchStartFinishCoordinates()
    this.fetchNotifications()
  }

  fetchNotifications(){
        //Call API with default preferred route if no preferred route chosen
    let start = this.state.startValue;
    let finish = this.state.destinationValue

    const paramsString = 'thresholdScore=9&partner=runkeeper&userId=101&start=Kendall%20Sq.%2C%20Cambridge%20MA&finish=Boston%20MA&smartmode=off'
    const data = {
      thresholdScore:'9',
      partner:'runkeeper',
      userId: '101',
      smartmode: 'off',
    };
    var params = `thresholdScore=${data.thresholdScore}&partner=${data.partner}&userId=${data.userId}&start=${start}&finish=${finish}&smartmode=${data.smartmode}`

    //fetch cyclist route from Nodal API
    fetch(baseURL + cyclistRouteURL + params)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({notifications: responseJson});
      })
      .catch((error) => {
        console.error(error);
      });

  }

  //Get the start and finish coordinates from Mapbox API from entered address
  fetchStartFinishCoordinates(){
    let start = this.state.startValue;
    let finish = this.state.destinationValue
    let startURL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${start}.json?access_token=${MAPBOX_TOKEN}`
    let endURL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${finish}.json?access_token=${MAPBOX_TOKEN}`

    fetch(startURL)
      .then((response) => response.json())
      .then((responseJson) => {
        var coords = responseJson.features[0].center
        var coordsString = coords[0] + "," + coords[1]
        this.setState({startingCoords: coordsString}, this.getDirections);
        })
      .catch((error) => {
        console.error(error);
      });

    fetch(endURL)
      .then((response) => response.json())
      .then((responseJson) => {
        var coords = responseJson.features[0].center
        var coordsString = coords[0] + "," + coords[1]
        this.setState({finishCoords: coordsString}, this.getDirections);
        })

      .catch((error) => {
        console.error(error);
      });
  }

  //Get directions for start and end coords from Mapbox API
  getDirections(){
    let startingCoords = this.state.startingCoords
    let finishCoords = this.state.finishCoords

    if(startingCoords != null && finishCoords != null){
      //TODO: put correct lat / long in and manipulate data into what it needs to be for the line layer
      //also use geocode to convert start and finish to lat and lon 
      fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${startingCoords};${finishCoords}?steps=true&access_token=${MAPBOX_TOKEN}`)
        .then((response) => response.json())
        .then((responseJson) => {

          let legs = responseJson.routes[0].legs

          let steps = legs[0].steps
          var directionsArray = []
          steps.forEach((step) => {
            directionsArray.push(step.maneuver.location)
          })

          var directions = []
          for(var i = 0; i < directionsArray.length - 2; i++){
            let direction = {"start": directionsArray[i], "end": directionsArray[i+1]}
            directions.push(direction)
          }
          this.setState({directions: directions});

        })
        .catch((error) => {
          console.error(error);
      });

      }
  }

  handleTextInputChange(e){
    this.setState({ startingCoords: null });
    this.setState({ finishCoords: null });

    if(e.target.id == "start"){
      this.setState({ startValue: e.target.value },this.getValidationState);
    }else if(e.target.id == "destination"){
      this.setState({ destinationValue: e.target.value },this.getValidationState);
    }

  }

  getValidationState(){
    if(this.state.startValue.length > 0 && this.state.destinationValue.length > 0){
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
    const {viewport, routes, hazards, selectedRoute, dropdownValue, dottedRoutes, notifications, directions} = this.state;

    let map = null;
    if (dropdownValue !== null) {
      map = <MapGL
          {...viewport}
          mapStyle="mapbox://styles/mapbox/dark-v9"
          perspectiveEnabled={true}
          onChangeViewport={this._onChangeViewport.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}>
          <NotificationsOverlay viewport={viewport}
            notifications= {notifications}
            onHover= {this._onHoverNotification.bind(this)}
            directions={directions}
            />
        </MapGL>
    } else {
      map = <MapGL
          {...viewport}
          mapStyle="mapbox://styles/mapbox/dark-v9"
          perspectiveEnabled={true}
          onChangeViewport={this._onChangeViewport.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}>
          <NotificationsOverlay viewport={viewport}
            notifications= {notifications}
            onHover= {this._onHoverNotification.bind(this)}
            directions={directions}
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
        {hoveredNotification.notificationDescription}
      </div>
    );

  }


  //render search buttons

  _renderSearchButtons(){

    const hasUserInput = this.state.hasUserInput
    const startValue = this.state.startValue
    const destinationValue = this.state.destinationValue
    return (
       <div>
        <FormGroup>
          <FormControl 
            id="start" 
            type="text" 
            placeholder="Starting Point"
            onChange={this.handleTextInputChange.bind(this)}
            value= {startValue}
          />
          <InputGroup>
            <FormControl 
              id="destination" 
              type="text" 
              placeholder="Destination"
              onChange={this.handleTextInputChange.bind(this)}
              value= {destinationValue}
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
