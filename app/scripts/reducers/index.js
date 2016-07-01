import { combineReducers } from 'redux';
import { routerReducer } from 'containers/Router';
import auth from 'reducers/auth';
import activity from 'reducers/activity';
import user from 'reducers/user';
import learningPath from 'reducers/learningPath';
import story from 'reducers/story';
import pairing from 'reducers/pairing';

const rootReducer = combineReducers({
  router: routerReducer,
  auth,
  activity,
  user,
  learningPath,
  story,
  pairing,
});

export default rootReducer;
