/* global window,document */
import React, {Component, PureComponent} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from '../overlays/deckgl-overlay.js';
import Select from 'react-select';
import {Button, FormControl, FormGroup, InputGroup} from 'react-bootstrap';
import {json as requestJson} from 'd3-request';
import NotificationsOverlay from '../overlays/notifications-overlay.js'
import ClustersOverlay from '../overlays/clusters-overlay.js'
import RouteInterpolation from '../helpers/RouteInterpolation'



// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiYW50aG9ueWVtYmVybGV5IiwiYSI6ImNqMWJvNzMwazBhbGMyd3Fxbmlhb3VycGgifQ.997zUWJQeWgUY5ERLL3GWg"; // eslint-disable-line
const strokeWidth = 12;
const yMargin = 25
const defaultZoom = 13
const baseURL = 'https://connect20-env.us-west-2.elasticbeanstalk.com:8443/v01/webapi/'
const getIllegalPointsURL = 'http://localhost:7555/getAllPoints'
const blockRadius = 70; //meters
const citationsNearbyThreshold = 4;

const notifications = [{"coordinates": [-122.41768518294768, 37.775718895275176]},{"coordinates": [-122.4174537427158, 37.75098194068737]}]
const arcs = [{"source": [-122.41768518294768, 37.775718895275176], "target": [-122.4174537427158, 37.75098194068737]}]
const currentLocation = [{"coordinates": [-122.4179338742409, 37.775576481212994]}]

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
      directions: null,
      allPoints:null,
      showPin: false,
      showChooseProduct : false,
      showOverlay : false,
      showCurrentLocation : true,
      showConfirmPickup: false,
      showBottomButtons: true,

    };
    this.fetchAllPoints();


  }



  //get points
  goButtonClicked(){
    
  }

  fetchAllPoints(){

    fetch(getIllegalPointsURL)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({allPoints: responseJson}, this.callIsIllegalPoint);

      })
      .catch((error) => {
        console.error(error);
      });

  }

  confirmPickupPressed(){

  }

  homeButtonPressed(){
    this.setState({showChooseProduct: true});
    this.setState({showPin: false});
    this.setState({showOverlay: true})
    this.setState({showCurrentLocation: false})
    this.setState({showConfirmPickup: false})
    this.setState({showBottomButtons: false})
    
    this.setState({viewport: {
        ...DeckGLOverlay.defaultViewport,
        latitude:   37.742931956973976,
        longitude: -122.41316964135513,
        zoom: 11.764674422251213,
        width: 375,
        height: 667
      }})

    

  }

  imagePressed(){
    this.setState({showChooseProduct: false});
    this.setState({showPin: true});
    this.setState({showOverlay: false})
    this.setState({showCurrentLocation: true})
    this.setState({showConfirmPickup: true})
    this.setState({viewport: {
        ...DeckGLOverlay.defaultViewport,
        zoom: 17.27003047502877,
        latitude: 37.77635162963392,
        longitude: -122.41801992946719,
        width: 375,
        height: 667
      }})
  }

  callIsIllegalPoint(){
    console.log(this.isIllegalPoint(37.7768899966383, -122.395297108465))
  }

  isIllegalPoint(lat1,lng1){

    var allPoints = this.state.allPoints;
    var count = 0;
    allPoints.forEach((point)=>{
      let lat2 = point.lat;
      let lng2 = point.lng;
      var d = RouteInterpolation.CalculateDistanceBetweenLocations(lat1, lng1, lat2, lng2);
      let dMeters = d * 1000;

      if(dMeters < blockRadius){
        count = count +1;
      }

      if (point.isIllegalPoint == 1){
        return true
      }
    })
    if (count > citationsNearbyThreshold){
      return true
    }
    return false
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
    console.log(viewport);
    if(viewport.isDragging == false){
      console.log(this.isIllegalPoint(viewport.latitude, viewport.longitude));
    }

  }

  //when the user hovers over a notification
  _onHoverNotification({x, y, object}) {
    this.setState({x, y, hoveredNotification: object});
  }



  //MARK: Render methods

  //Render the map and route overlays
  _renderMap() {
    const {viewport, routes, hazards, selectedRoute, dropdownValue, dottedRoutes, directions} = this.state;
    let map = null;
    if (dropdownValue !== null) {
      map = <MapGL
          {...viewport}
          mapStyle="mapbox://styles/mapbox/basic-v9"
          perspectiveEnabled={true}
          onChangeViewport={this._onChangeViewport.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          >

          
          <NotificationsOverlay viewport={viewport}
            notifications= {this.state.showOverlay ? notifications : null}
            currentLocation = {currentLocation}
            arcs = {this.state.showOverlay ? arcs : null}
            onHover= {this._onHoverNotification.bind(this)}
            />
   
          
        </MapGL>
    } else {
      map = <MapGL
          {...viewport}
          mapStyle="mapbox://styles/mapbox/basic-v9"
          perspectiveEnabled={true}
          onChangeViewport={this._onChangeViewport.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}>
          <NotificationsOverlay viewport={viewport}
            notifications= {notifications}
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
        { this.state.showPin ? <div id="pin">
            <img src="../assets/pin.PNG" />
        </div> : null}

        { this.state.showConfirmPickup ? <div id="confirmPickup">
            <img onClick = {this.confirmPickupPressed.bind(this)} src="../assets/confirmPickup.PNG" />
        </div> : null}

        { this.state.showBottomButtons ? <div id="homeButton">
            <img onClick = {this.homeButtonPressed.bind(this)} src="../assets/homeButton.PNG" />
        </div> : null}

        { this.state.showBottomButtons ? <div id="middleButton">
            <img src="../assets/middleButton.PNG" />
        </div> : null}
        { this.state.showBottomButtons ? <div id="rightButton">
            <img src="../assets/middleButton.PNG" />
        </div> : null}

        { this.state.showBottomButtons ? <div id="whereTo">
            <img src="../assets/whereTo.PNG" />
        </div> : null}

        { this.state.showBottomButtons ? <div id="uberCar">
            <img src="../assets/uberCar.PNG" />
        </div> : null}

        { this.state.showBottomButtons ? <div id="eatsCard">
            <img src="../assets/eatsCard.PNG" />
        </div> : null}







        {this.state.showChooseProduct ? <div id="chooseProduct">
           <img  onClick = {this.imagePressed.bind(this)} src="../assets/chooseProducts.png" />
        </div> : null }
        
        <div id="map">
          {this._renderMap()}
          {this._renderToolTip()}
        </div>

      </div>
    );
  }
}
