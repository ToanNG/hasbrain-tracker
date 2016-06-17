import { combineReducers } from 'redux';
import { routerReducer } from 'containers/Router';
import auth from 'reducers/auth';
import activity from 'reducers/activity';
import user from 'reducers/user';
import learningPath from 'reducers/learningPath';
import story from 'reducers/story';

const rootReducer = combineReducers({
  router: routerReducer,
  auth,
  activity,
  user,
  learningPath,
  story,
});

export default rootReducer;
