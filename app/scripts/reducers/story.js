import { List, Map } from 'immutable';

const INITIAL_STATE = Map({
  stories: null,
});

export default function story(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'GET_COMPLETE_STORIES':
      return state;

    case 'GET_COMPLETE_STORIES_SUCCESS':
      return state.set('stories', action.result);

    case 'GET_COMPLETE_STORIES_FAIL':
      return state.set('stories', null);

    default:
      return state;
  }
}
