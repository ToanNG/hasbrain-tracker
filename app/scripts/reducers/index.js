import { combineReducers } from 'redux';
import { routerReducer } from 'containers/Router';
import movie from 'reducers/movie';
import auth from 'reducers/auth';
import activity from 'reducers/activity';

const rootReducer = combineReducers({
  router: routerReducer,
  movie,
  auth,
  activity,
});

export default rootReducer;
