import { List, Map } from 'immutable';
import { GET_TODAY_ACTIVITY, GET_TODAY_ACTIVITY_SUCCESS, GET_TODAY_ACTIVITY_FAIL } from 'constants/ActionTypes';

const INITIAL_STATE = Map({
  todayActivity: null,
});

export default function auth(state = INITIAL_STATE, action) {
  switch (action.type) {
    case GET_TODAY_ACTIVITY:
      return state;

    case GET_TODAY_ACTIVITY_SUCCESS:
      return state.set('todayActivity', action.result);

    case GET_TODAY_ACTIVITY_FAIL:
      return state.set('todayActivity', null);

    case 'START_ACTIVITY_SUCCESS':
      return state.set('todayActivity', action.result);

    default:
      return state;
  }
}
