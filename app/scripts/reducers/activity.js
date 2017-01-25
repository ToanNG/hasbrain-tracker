import { List, Map } from 'immutable';
import {
  GET_TODAY_ACTIVITY,
  GET_TODAY_ACTIVITY_SUCCESS,
  GET_TODAY_ACTIVITY_FAIL,
  START_ACTIVITY_SUCCESS,
} from 'constants/ActionTypes';

const INITIAL_STATE = Map({
  todayActivity: null,
  isSubmitting: false,
  finishGettingTodayActivity: false,
});

export default function activity(state = INITIAL_STATE, action) {
  switch (action.type) {
    case GET_TODAY_ACTIVITY:
      return state.set('finishGettingTodayActivity', false);

    case GET_TODAY_ACTIVITY_SUCCESS:
      return state.set('todayActivity', action.result).set('finishGettingTodayActivity', true);

    case GET_TODAY_ACTIVITY_FAIL:
      return state.set('todayActivity', null).set('finishGettingTodayActivity', true);

    case 'GIVE_UP_ACTIVITY':
      return state.set('isSubmitting', true);

    case 'GIVE_UP_ACTIVITY_FAIL':
      return state.set('isSubmitting', false);

    case 'CREATE_ACTIVITY_SUCCESS':
      return state.set('todayActivity', action.result);

    case START_ACTIVITY_SUCCESS:
      return state.set('todayActivity', action.result);

    case 'SHOW_KNOWLEDGE_SUCCESS':
      return state.set('todayActivity', action.result);

    case 'UPDATE_STORY_SUCCESS':
      return state.set('todayActivity', action.result);

    default:
      return state;
  }
}
