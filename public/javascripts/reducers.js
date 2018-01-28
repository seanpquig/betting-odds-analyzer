import { combineReducers } from 'redux'


function portfolioChanges(state = { portfolioBets: [] }, action) {
  switch (action.type) {
    case "ADD_BET":
      return {
        portfolioBets: [].concat(state.portfolioBets, {name: 'McGoat', moneyLine: 200})
      };
    default:
      return state;
  }
}

const betAppReducer = combineReducers({
  portfolioChanges
});

export default betAppReducer;