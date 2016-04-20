import { List, Map } from 'immutable';

const INITIAL_STATE = Map({
  paths: List(),
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

    default:
      return state;
  }
}
