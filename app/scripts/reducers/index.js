import { combineReducers } from 'redux';
import { routerReducer } from 'containers/Router';
import movie from 'reducers/movie';

const rootReducer = combineReducers({
  router: routerReducer,
  movie,
});

export default rootReducer;
