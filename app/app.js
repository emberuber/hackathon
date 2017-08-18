/* global window,document */
import React, {Component, PureComponent} from 'react';
import {render} from 'react-dom';
import NodalNav from './components/nodal-navbar.js'
import Recommendations from './components/recommendations.js'
import Notifications from './components/notifications.js'
import RouteAnnotations from './components/route-annotations.js'
import Clusters from './components/clusters.js'
import Heatmap from './components/heatmap.js'
import Collisions from './components/collisions.js'
import GoogleMapReact from 'google-map-react';



import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'





class Root extends PureComponent {




  //Initialization functions

  constructor(props) {
    super(props);
    this.state = {


    };

  }

  //Render the Root component
          //   <div id="navbar">
          //   <NodalNav />
          // </div>
  render() {

    return (

      <Router>
        <div>

          <div id="container">
            <Route 
              exact path='/' 
              component={Home}>
            </Route>
            <Route 
              path='/Recommendations' 
              component={Notifications}>
            </Route>
            <Route 
              path='/Clusters' 
              component={Clusters}>
            </Route>
            <Route 
              path='/Notifications' 
              component={Notifications}>
            </Route>
            <Route 
              path='/RouteAnnotations' 
              component={RouteAnnotations}>
            </Route>
            <Route 
              path='/Heatmaps' 
              component={Heatmap}>
            </Route>
            <Route 
              path='/Collisions' 
              component={Collisions}>
            </Route>
          </div>
        </div>
      </Router>
      

    );
  }
}


const Home = () => (
  <div>
  <Notifications>
  </Notifications>
  </div>
)





render(<Root />, document.body.appendChild(document.createElement('div')));
