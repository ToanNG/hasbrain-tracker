import { combineReducers } from 'redux';
import { routerReducer } from 'containers/Router';
import movie from 'reducers/movie';
import auth from 'reducers/auth';

const rootReducer = combineReducers({
  router: routerReducer,
  movie,
  auth,
});

export default rootReducer;
