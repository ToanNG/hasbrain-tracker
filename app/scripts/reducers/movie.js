import { SET_ENTRIES, FETCH_PENDING, FETCH_SUCCESS, FETCH_FAILURE } from 'constants/ActionTypes';
import { setEntries, INITIAL_STATE } from 'cores/movie';

export default function movie(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_ENTRIES:
      return setEntries(state, action.entries);

    case FETCH_PENDING:
      return state.merge({ isLoading: true });

    case FETCH_SUCCESS:
      return setEntries(state, action.result.entries).merge({ isLoading: false });

    case FETCH_FAILURE:
      return state.merge({ isLoading: true });

    default:
      return state;
  }
}
