import { SET_ENTRIES } from 'constants/ActionTypes';
import { setEntries, INITIAL_STATE } from 'cores/movie';

export default function movie(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_ENTRIES:
      return setEntries(state, action.entries);

    default:
      return state;
  }
}
