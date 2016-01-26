import { combineReducers } from 'redux';
import { routerReducer } from 'containers/Router';
import auth from 'reducers/auth';
import activity from 'reducers/activity';

const rootReducer = combineReducers({
  router: routerReducer,
  auth,
  activity,
});

export default rootReducer;
