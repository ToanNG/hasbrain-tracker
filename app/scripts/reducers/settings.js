import { List, Map } from 'immutable';

const INITIAL_STATE = Map({
  settings: null,
});

export default function settings(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'GET_SETTINGS':
      return state;

    case 'GET_SETTINGS_SUCCESS':
      return state.set('settings', action.result);

    case 'GET_SETTINGS_FAIL':
      return state.set('settings', null);

    default:
      return state;
  }
}
