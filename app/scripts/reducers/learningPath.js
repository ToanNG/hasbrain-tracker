import { List, Map } from 'immutable';

const INITIAL_STATE = Map({
  paths: List(),
  path: null,
});

export default function learningPath(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'GET_PATHS':
      return state;

    case 'GET_PATHS_SUCCESS':
      return state.merge({
        paths: action.result.learningPaths
      });

    case 'GET_PATHS_FAIL':
      return state.merge({
        paths: []
      });

    case 'GET_MY_PATH':
      return state;

    case 'GET_MY_PATH_SUCCESS':
      return state.set('path', action.result);

    case 'GET_MY_PATH_FAIL':
      return state.set('path', null);

    default:
      return state;
  }
}
