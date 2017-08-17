/* global window,document */
import React, {Component, PureComponent} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from '../overlays/deckgl-overlay.js';
import Select from 'react-select';
import {Button, FormControl, FormGroup, InputGroup} from 'react-bootstrap';
import RouteInterpolation from '../helpers/RouteInterpolation'
import {json as requestJson} from 'd3-request';

// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiYW50aG9ueWVtYmVybGV5IiwiYSI6ImNqMWJvNzMwazBhbGMyd3Fxbmlhb3VycGgifQ.997zUWJQeWgUY5ERLL3GWg"; // eslint-disable-line
const strokeWidth = 12;
const btnSelectedStyle ={backgroundColor: '#00B3C2', borderColor:'#00B3C2'}
const kmBetweenDots = .025

function coordinatesToString(coordinates){
  return coordinates.join()
}


var optionsSelect = [
  { value: 'safety', label: 'Safety' },
  { value: 'scenic beauty', label: 'Scenic Beauty' },
  { value: 'route popularity', label: 'Route Popularity' },
  { value: 'air quality', label: 'Air Quality' },
  { value: 'elevation change', label: 'Elevation Change' }
];


export default class Recommendations extends PureComponent {


  //Initialization functions

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500
      },
      routes: null,
      hazards: null,
      dropdownValue: null,
      selectedRoute: null,
      dottedRoutes:null,
      selectedRouteCoordinates: null,
      hasUserInput: false,
      destinationValue: "",
      startValue: ""

    };

    requestJson('../data/test-routes.json', (error, response) => {
      if (!error) {
        this.setState({routes: response});
      }
    });
    requestJson('../data/hazards.json', (error, response) => {
      if (!error) {
        this.setState({hazards: response});
      }
    });
  }


  //MARK: Start and Destination helper methods
  goButtonClicked(){
    console.log("call API!!")
    //Call API with default preferred route if no preferred route chosen

  }

  handleTextInputChange(e){
    if(e.target.id == "start"){
      this.setState({ startValue: e.target.value },this.getValidationState);
    }else if(e.target.id == "destination"){
      this.setState({destinationValue: e.target.value},  this.getValidationState);
    }

  }

  getValidationState(){
    if(this.state.startValue.length > 0 && this.state.destinationValue.length > 0){
      this.setState({hasUserInput: true})
    }else{
      this.setState({hasUserInput: false})
    }
  }




  //MARK: Route Picking Methods

  //every time the dropdown changes
  _onDropdownChange(val) {
    this.setState({ 
      dropdownValue: val.value,
    });
    //call API to get desired routes for the given metric
    this._selectRoute(1)
  }

  _selectRoute(routeNum){


    let selectedRouteCoordinates = [];
    let routes = this.state.routes;
    routes.forEach((route) => {
      if(route.name === routeNum.toString()){
        selectedRouteCoordinates.push(route.start);
        selectedRouteCoordinates.push(route.end);
      }

    });


    this.setState({ 
      selectedRoute: routeNum,
      selectedRouteCoordinates: selectedRouteCoordinates
    });

    this._getDottedRouteFromRoute(selectedRouteCoordinates);


  }

  _onRouteButtonClick(buttonNumber) {
    this._selectRoute(buttonNumber)
  }



  //This function takes in the coordinates of the current selected route and will update which routes should be dotted
  //which will trigger a re-render on the screen
  _getDottedRouteFromRoute(selectedRouteCoordinates){
    var routes = this.state.routes
    var points = [];
    routes.forEach((route) => {
      let start = route.start
      let end = route.end

      var travelledDistance = 0;
      let totalDistance = RouteInterpolation.CalculateDistanceBetweenLocations(start, end);

      //convert segment coordinates to string to see if the segment is in the current route
      let segmentString = coordinatesToString([start, end])
      let selectedCoordinatesString = coordinatesToString(selectedRouteCoordinates)

      if(!selectedCoordinatesString.includes(segmentString)){
        var travelledDistance = 0;
        let totalDistance = RouteInterpolation.CalculateDistanceBetweenLocations(start, end);

        //interpolate between the start and end points with dots
        while(travelledDistance + kmBetweenDots < totalDistance ){
          let bearing = RouteInterpolation.CalculateBearing(start, end);
          let distanceInKm = kmBetweenDots;
          let intermediaryLocation = RouteInterpolation.CalculateDestinationLocation(start, bearing, distanceInKm);

          // add intermediary location to list
          points.push({
            "coordinates": intermediaryLocation
          })

          // set intermediary location as new starting location
          start = intermediaryLocation;
          travelledDistance = travelledDistance + distanceInKm;
        }

        points.push({
            "coordinates": start
        })
        points.push({
            "coordinates": end
        })
      }
      

    });
    this.setState({dottedRoutes: points});

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



  //MARK: Render methods

  //Render the map and route overlays
  _renderMap() {
    const {viewport, routes, hazards, selectedRoute, dropdownValue, dottedRoutes} = this.state;

    let map = null;
    if (dropdownValue !== null) {
      map = <MapGL
          {...viewport}
          mapStyle="mapbox://styles/mapbox/dark-v9"
          perspectiveEnabled={true}
          onChangeViewport={this._onChangeViewport.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}>
          <DeckGLOverlay viewport={viewport}
            strokeWidth={strokeWidth}
            routes={routes}
            hazards={hazards}
            selectedRoute= {selectedRoute}
            dottedRoutes={dottedRoutes}
            />
        </MapGL>
    } else {
      map = <MapGL
          {...viewport}
          mapStyle="mapbox://styles/mapbox/dark-v9"
          perspectiveEnabled={true}
          onChangeViewport={this._onChangeViewport.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}>
        </MapGL>
    }
    return (
      map
    );


  }

  //Render the dropdown menue
  _renderDropDown() {
    const dropdownValue = this.state.dropdownValue;
    return (
      <Select
        name="preferred-route-dropdown"
        value={dropdownValue}
        options={optionsSelect}
        clearable = {false}
        placeholder={"Choose your preferred route"}
        onChange={this._onDropdownChange.bind(this)}
      />


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
                onClick= {this.goButtonClicked}>Go</Button>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>
       </div>
    );
  }


  //render the button group
  _renderRouteButtonGroup(){
    const selectedButton = this.state.selectedRoute;
    const dropdownValue = this.state.dropdownValue;

    let buttonGroup = null;
        //hacky solution to figure out which button is clicked
    //TODO: figure out which button from the 
    if(dropdownValue != null){
      buttonGroup = <div className="route-button-group">
        <Button 
          className="route-button"
          style = {selectedButton == 1 ? btnSelectedStyle : null} 
          onClick = {(e) => {
                this._onRouteButtonClick.bind(this)
                this._onRouteButtonClick(1)
          }}
          >
          Route 1   |   5.72km   |  15mins
        </Button>
        <Button 
          className="route-button"
          style = {selectedButton == 2 ? btnSelectedStyle : null} 
          onClick = {(e) => {
                this._onRouteButtonClick.bind(this)
                this._onRouteButtonClick(2)
          }}>

          Route 2    |   6.35km   |   18mins
        </Button>
        <Button
          className="route-button" 
          block
          style = {selectedButton == 3 ? btnSelectedStyle : null} 
          onClick = {(e) => {
                this._onRouteButtonClick.bind(this)
                this._onRouteButtonClick(3)
          }}>
          Route 3   |    6.17km   |   17mins
        </Button>
      </div>
    }
    

    return(
      buttonGroup
    );
  }

  //Render the Root component
  render() {

    return (
      <div id="container">
        {/* <NodalNav /> */}
        <div id="map">
          {this._renderMap()}
        </div>
        <div id="navigation-group">
          <div id="dropdown">
            {this._renderSearchButtons()}
            {this._renderDropDown()}
          </div>
          {this._renderRouteButtonGroup()}
        </div>
      </div>
    );
  }
}
