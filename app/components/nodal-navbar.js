import React, {Component} from 'react';
import {Navbar, NavItem, NavDropdown, MenuItem, Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom';
import { slide as Menu } from 'react-burger-menu'




export default class NodalNav extends Component {
  
  handleSelect(eventKey){

  }

  render() {
    // NEED TO ADD BELOW SOMEHOW --> currently it breaks
/*
    const buttons = Object.keys(this.props.menus).map((menu) => {
      return (
        <a key={menu}
          className={classNames({'current-demo': menu === this.state.currentMenu})}
          onClick={this.changeMenu.bind(this, menu)}>
          {this.props.menus[menu].buttonText}
        </a>
      );
    }); */

    // NEED TO ADD "{this.getMenu()}" to the render return() method somewhere...

    return (


      <div className="Navbar">
        <Navbar  onSelect={this.handleSelect}>
          
          <Navbar.Header>
            <Navbar.Brand>

              <Link to="#">
                <img src={"../assets/NodalWebLogoGray-01.png"} style={{width:100}} />
              </Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>

          <Nav pullLeft>
            <NavItem eventKey={0}>
            </NavItem>
            <NavItem eventKey={1} >
              <Link to="/Recommendations">Recommendations</Link>
            </NavItem>
            <NavItem eventKey={4} >
              <Link to="/Heatmaps">Illegal Pickups</Link>
            </NavItem>
          </Nav>

          <Nav pullRight>
            <NavItem eventKey={5} href="#"><img src={"../assets/navbar/Settings.png"} style={{height:15}} /></NavItem>
            <NavItem eventKey={6} href="#"><img src={"../assets/navbar/Details.png"} style={{height:15}} /></NavItem>
            <NavDropdown eventKey={2} id="basic-nav-dropdown">
              <MenuItem eventKey={2.1}>
                  <Link to="#">Documentation</Link>
              </MenuItem>
              <MenuItem eventKey={2.2}>
                <Link to="#">Support</Link>
              </MenuItem>
              <MenuItem eventKey={2.3}>
                <Link to="#">Logout</Link>
              </MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar>
      </div>


    );
  }
}

const menus = {
  slide: {buttonText: 'Slide'},
  stack: {buttonText: 'Stack'},
  elastic: {buttonText: 'Elastic'},
  bubble: {buttonText: 'Bubble'},
  push: {buttonText: 'Push'},
  pushRotate: {buttonText: 'Push Rotate'},
  scaleDown: {buttonText: 'Scale Down'},
  scaleRotate: {buttonText: 'Scale Rotate'},
  fallDown: {buttonText: 'Fall Down'}
};
