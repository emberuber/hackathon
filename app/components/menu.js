import React, {Component} from 'react';

import {Navbar, NavItem, NavDropdown, MenuItem, Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom';




export default class NodalNav extends Component {

  handleSelect(eventKey){

  }

  render() {


    return (


      <div className="Navbar">
        <Navbar  onSelect={this.handleSelect}>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">Nodal</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Nav pullLeft>
            <NavItem eventKey={1} >
              <Link to="/Recommendations">Recommendations</Link>
            </NavItem>
            <NavDropdown eventKey={2} title="Scores" id="basic-nav-dropdown">
              <MenuItem eventKey={2.1}>
                  <Link to="/Clusters">Clusters</Link>
              </MenuItem>
              <MenuItem eventKey={2.2}>
                <Link to="/RouteAnnotations">Route Annotations</Link>
              </MenuItem>
              <MenuItem eventKey={2.3}>
                <Link to="/Heatmaps">Heatmaps</Link>
              </MenuItem>
              <MenuItem eventKey={2.3}>
                <Link to="/Collisions">Collisions</Link>
              </MenuItem>
              <MenuItem eventKey={3.3}>Device Locations</MenuItem>
            </NavDropdown>
            <NavItem eventKey={4} >
              <Link to="/Notifications">Notifications</Link>
            </NavItem>
          </Nav>
          
          <Nav pullRight>
            <NavItem eventKey={1} href="#">Log Out</NavItem>
          </Nav>
        </Navbar>
      </div>


    );
  }
}
