import React from 'react';
import ReactDOM from 'react-dom';
import { Col } from 'react-bootstrap';
import BettingNavbar from './BettingNavbar';
import MatchSelector from './MatchSelector';


const view = (
  <div>
    <div>
      <BettingNavbar />
    </div>
    <MatchSelector />
  </div>
);

ReactDOM.render(view, document.getElementById('root'));