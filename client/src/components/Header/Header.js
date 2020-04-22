import React, { Component } from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { Navbar, NavItem, NavDropdown, MenuItem, Nav, Dropdown } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'

import config from '../../../../config'
import { UserToggle } from '../'
import logo from '../../static/logo.png'
import './Header.css'

class Header extends Component {

  isAdmin() {
    const { user } = this.props
    return user && user.rank >= 2
  }

  render() {
    const { user } = this.props
    return (
      <Navbar fixedTop className="Navbar">
        <Navbar.Header>
          <Navbar.Brand>
            <img src={logo} className="Navbar__Logo" alt="logo" />
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <LinkContainer activeClassName="" to="/jackpot">
              <NavItem>Jackpot</NavItem>
            </LinkContainer>
            <LinkContainer activeClassName="" to="/coinflip">
              <NavItem>Coinflip</NavItem>
            </LinkContainer>
            <LinkContainer activeClassName="" to="/history">
              <NavItem>History</NavItem>
            </LinkContainer>
            <LinkContainer activeClassName="" to="/faq">
              <NavItem>FAQ</NavItem>
            </LinkContainer>
            <LinkContainer activeClassName="" to="/tos">
              <NavItem>TOS</NavItem>
            </LinkContainer>
            <LinkContainer activeClassName="" to="/support">
              <NavItem>Support</NavItem>
            </LinkContainer>
            { this.isAdmin() &&
              <NavDropdown title="Admin" id="nav-dropdown">
                <LinkContainer activeClassName="" to="/admin/trades">
                  <MenuItem>Trade Offers</MenuItem>
                </LinkContainer>
                <LinkContainer activeClassName="" to="/admin/rake">
                  <MenuItem>Rake</MenuItem>
                </LinkContainer>
              </NavDropdown>
            }
            {/* <NavDropdown title="Other" id="nav-dropdown">
              <LinkContainer activeClassName="" to="/giveaway">
                <MenuItem>
                  <FontAwesome name="gift" />
                  Giveaway
                </MenuItem>
              </LinkContainer>
              <LinkContainer activeClassName="" to="/faq">
                <MenuItem>
                  <FontAwesome name="question-circle-o" />
                  FAQ
                </MenuItem>
              </LinkContainer>
                <MenuItem href="http://support.h1z1brawl.com" target="_blank">
                  <FontAwesome name="envelope-o" />
                  Support
                </MenuItem>
            </NavDropdown> */}
          </Nav>
          <Nav pullRight>
            <MenuItem href={config.metadata.discord} target="_blank" className="no-border">
              <i className="fab fa-discord" />
            </MenuItem>
            <MenuItem href={config.metadata.twitter} target="_blank" className="no-border" style={{paddingRight: '15px'}}>
              <i className="fab fa-twitter" />
            </MenuItem>
            { user ? (
              <Dropdown className="Navbar__Dropdown" id="image-dropdown">
                <UserToggle bsRole="toggle">
                  <i className="fa fa-ellipsis-v" />
                  <img src={user.image} alt="user" />
                  <span className="Navbar__Dropdown-Level">{user.level}</span>
                </UserToggle>
                <Dropdown.Menu>
                  <MenuItem onClick={this.props.onSettingsClick}>
                    <FontAwesome name="cog" />
                    Settings
                  </MenuItem>
                  <LinkContainer activeClassName="" to="/history">
                    <MenuItem>
                      <FontAwesome name="history" />
                      History
                    </MenuItem>
                  </LinkContainer>
                  <MenuItem href={`${config.api.url}api/auth/logout`}>
                    <FontAwesome name="sign-out" />
                    Logout
                  </MenuItem>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <MenuItem className="Login" href={`${config.api.url}api/auth/steam`}>
                <i className="fab fa-steam-square" />
                <span style={{marginLeft: '8px'}}>Login</span>
              </MenuItem>
            ) }
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }

}

export default Header
