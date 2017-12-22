import React from 'react';
import ReactDOM from 'react-dom';
import { Col } from 'react-bootstrap';
import BettingNavbar from './BettingNavbar';

const view = (
  <div>
    <div>
      <BettingNavbar />
    </div>
    <Col md={12} id="table-container">
    </Col>
  </div>
);

ReactDOM.render(view, document.getElementById('root'));