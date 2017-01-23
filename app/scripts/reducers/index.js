import { combineReducers } from 'redux';
import { routerReducer } from 'containers/Router';
import auth from 'reducers/auth';
import activity from 'reducers/activity';
import user from 'reducers/user';
import learningPath from 'reducers/learningPath';
import story from 'reducers/story';
import pairing from 'reducers/pairing';
import quiz from 'reducers/quiz';
import settings from 'reducers/settings';

const rootReducer = combineReducers({
  router: routerReducer,
  auth,
  activity,
  user,
  learningPath,
  story,
  pairing,
  quiz,
  settings,
});

export default rootReducer;
