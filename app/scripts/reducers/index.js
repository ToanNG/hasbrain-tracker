import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';
import movie from 'reducers/movie';

const rootReducer = combineReducers({
  router: routerStateReducer,
  movie,
});

export default rootReducer;
