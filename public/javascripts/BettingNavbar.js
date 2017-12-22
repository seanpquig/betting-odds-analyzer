import React from 'react';
import { Navbar, Nav, NavItem } from 'react-bootstrap';

function BettingNavbar(props) {
  return (
    <Navbar inverse fixedTop>
      <Navbar.Header>
        <Navbar.Brand>
          <a href="#">BetAnalyzer</a>
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>
      <Nav>
        <NavItem eventKey={1} href="#" active={true}>Portfolio</NavItem>
      </Nav>
    </Navbar>
  );
}

export default BettingNavbar;