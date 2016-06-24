import { List, Map } from 'immutable';
import {
  GET_TODAY_ACTIVITY,
  GET_TODAY_ACTIVITY_SUCCESS,
  GET_TODAY_ACTIVITY_FAIL,
  START_ACTIVITY_SUCCESS,
  SUBMIT_ANSWER,
  SUBMIT_ANSWER_SUCCESS,
  SUBMIT_ANSWER_FAIL,
} from 'constants/ActionTypes';

const INITIAL_STATE = Map({
  todayActivity: null,
  isSubmitting: false,
});

export default function activity(state = INITIAL_STATE, action) {
  switch (action.type) {
    case GET_TODAY_ACTIVITY:
      return state.set('isSubmitting', false);

    case GET_TODAY_ACTIVITY_SUCCESS:
      return state.set('todayActivity', action.result);

    case GET_TODAY_ACTIVITY_FAIL:
      return state.set('todayActivity', null);

    case 'GIVE_UP_ACTIVITY':
      return state.set('isSubmitting', true);

    case 'GIVE_UP_ACTIVITY_FAIL':
      return state.set('isSubmitting', false);

    case 'CREATE_ACTIVITY_SUCCESS':
      return state.set('todayActivity', action.result);

    case START_ACTIVITY_SUCCESS:
      return state.set('todayActivity', action.result);

    case SUBMIT_ANSWER:
      return state.set('isSubmitting', true);

    case SUBMIT_ANSWER_FAIL:
      return state.set('isSubmitting', false);

    default:
      return state;
  }
}
