/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import CollisionsOverlay from '../overlays/collisions-overlay.js';
import Select from 'react-select';
import {Button, FormControl, FormGroup, InputGroup} from 'react-bootstrap';

import {csv as requestCsv} from 'd3-request';
import {json as requestJson} from 'd3-request';


// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiYW50aG9ueWVtYmVybGV5IiwiYSI6ImNqMWJvNzMwazBhbGMyd3Fxbmlhb3VycGgifQ.997zUWJQeWgUY5ERLL3GWg"; 
const baseURL = 'https://connect20-env.us-west-2.elasticbeanstalk.com:8443/v01/webapi/'
const collisionRouteURL = 'score/collision/route?'
const hexRadius = 30

export default class Collisions extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...CollisionsOverlay.defaultViewport,
        width: 500,
        height: 500
      },
      data: null,      
      startValue: "",
      destinationValue: "",
      directions: null,
      startingCoords: null,
      finishCoords: null,
      collisions: null

    };


    // requestCsv('../data/test-heatmaps.csv', (error, response) => {
    //   if (!error) {
    //     const data = response.map(d => ([Number(d.lng), Number(d.lat)]));
    //     this.setState({data});
    //   }
    // });

  }

  goButtonClicked(){

    this.getCollisionsData()
    this.fetchStartFinishCoordinates()

  }

  //textfield delegate methods
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

  //Get the start and finish coordinates from Mapbox API from entered address
  getCollisionsData(){
    //Call API with default preferred route if no preferred route chosen
    let start = this.state.startValue;
    let finish = this.state.destinationValue
    console.log(finish)

    const paramsString = 'thresholdScore=9&partner=runkeeper&userId=101&start=Kendall%20Sq.%2C%20Cambridge%20MA&finish=Boston%20MA&smartmode=off'
    const data = {
      userId: '101',
    };
    var params = `userId=${data.userId}&start=${start}&finish=${finish}`

    //fetch cyclist route from Nodal API
    fetch(baseURL + collisionRouteURL + params)
      .then((response) => response.json())
      .then((responseJson) => {
        var collisions = []
        responseJson.forEach((collisionObject) => {
          let coordinates = collisionObject.coordinates[0].coordinates
          collisions.push({"coordinates": coordinates})
          let numDuplicates = Math.round(collisionObject.relevantCollisionScore)
          //push duplicate coordinates for each collision score so it's like we are bucketing the collision scores
          for(var i = 0; i < numDuplicates; i++){
            collisions.push({"coordinates": coordinates})
          }
        })

        this.setState({collisions: collisions})

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

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    this._onChangeViewport({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onChangeViewport(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
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

  _renderMap() {
    const {viewport, data, directions, collisions} = this.state;
    return (
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        perspectiveEnabled={true}
        onChangeViewport={this._onChangeViewport.bind(this)}
        mapboxApiAccessToken={MAPBOX_TOKEN}>
        <CollisionsOverlay
          directions={directions}
          viewport={viewport}
          data={collisions || []}
          radius={hexRadius}
          upperPercentile={100}
          coverage={1}
        />
      </MapGL>
    )
  }

  render() {
    return(
      <div id="container">
        {/* <NodalNav /> */}
        <div id="map">
          {this._renderMap()}
        </div>
        <div id="navigation-group">
          <div id="dropdown">
            {this._renderSearchButtons()}
          </div>
        </div>
      </div>
  
    )
  }
}
