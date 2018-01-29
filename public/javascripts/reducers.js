import { combineReducers } from 'redux'


function portfolioChanges(state = { portfolioBets: [] }, action) {
  switch (action.type) {
    case "ADD_BET":
      return {
        portfolioBets: [].concat(state.portfolioBets, action.newBets)
      };
    default:
      return state;
  }
}

const betAppReducer = combineReducers({
  portfolioChanges
});

export default betAppReducer;