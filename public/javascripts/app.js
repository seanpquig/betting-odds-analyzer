import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import betAppReducer from './reducers'
import BettingNavbar from './BettingNavbar';
import MatchSelector from './MatchSelector';
import BetPortfolio from './BetPortfolio';


const store = createStore(betAppReducer);

const view = (
  <Provider store={store}>
    <div>
      <BettingNavbar />
      <MatchSelector />
      <BetPortfolio />
    </div>
  </Provider>
);

ReactDOM.render(view, document.getElementById('root'));