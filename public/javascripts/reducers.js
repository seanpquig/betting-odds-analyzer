import { combineReducers } from 'redux'


function betApply(state = {}, action) {
  switch (action.type) {
    case "ADD_TODO":
      return state;
    default:
      return state;
  }
}

const betReducer = combineReducers({
  betApply
});

export default betReducer;