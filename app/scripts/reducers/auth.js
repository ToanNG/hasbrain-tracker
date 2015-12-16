import { List, Map } from 'immutable';
import { LOGIN, LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT, RETRIEVE_TOKEN, RETRIEVE_TOKEN_SUCCESS, RETRIEVE_TOKEN_FAIL } from 'constants/ActionTypes';

const INITIAL_STATE = Map({
  isLoggingIn: undefined,
  isLoggedIn: undefined,
  error: null,
  token: null,
});

export default function auth(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOGIN:
      return state.merge({
        error: null,
        isLoggingIn: true,
        isLoggedIn: false,
      });

    case LOGIN_SUCCESS:
      return state.merge({
        error: null,
        isLoggingIn: false,
        isLoggedIn: true,
        token: action.result.access_token,
      });

    case LOGIN_FAIL:
      return state.merge({
        error: action.error,
        isLoggingIn: false,
        isLoggedIn: false,
      });

    case LOGOUT:
      return state.merge({
        isLoggedIn: false,
        token: null,
      });

    case RETRIEVE_TOKEN_SUCCESS:
      return state.merge({
        isLoggedIn: true,
        token: action.result,
      });

    case RETRIEVE_TOKEN_FAIL:
      return state.merge({
        isLoggedIn: false,
        token: null,
      });

    default:
      return state;
  }
}
