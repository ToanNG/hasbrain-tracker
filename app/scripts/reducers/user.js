import { List, Map } from 'immutable';
import {
  GET_USER,
  GET_USER_SUCCESS,
  GET_USER_FAIL,
} from 'constants/ActionTypes';

const INITIAL_STATE = Map({
  currentUser: null,
});

export default function user(state = INITIAL_STATE, action) {
  switch (action.type) {
    case GET_USER:
      return state;

    case GET_USER_SUCCESS:
      return state.set('currentUser', action.result);

    case GET_USER_FAIL:
      return state.set('currentUser', null);

    case 'UPDATE_CHAINING_SUCCESS':
      const curUser = state.get('currentUser');
      curUser.chaining = action.result.chaining;
      return state.set('currentUser', curUser);

    case 'ADD_POINTS_SUCCESS':
      const currentUser = state.get('currentUser');
      currentUser.points = action.result.points;
      return state.set('currentUser', currentUser);

    default:
      return state;
  }
}
