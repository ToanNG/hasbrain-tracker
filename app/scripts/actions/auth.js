import 'isomorphic-fetch';

import { LOGIN, LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT, RETRIEVE_TOKEN, RETRIEVE_TOKEN_SUCCESS, RETRIEVE_TOKEN_FAIL } from 'constants/ActionTypes';
import storage from 'helpers/storage';

export function login({ email, password }) {
  return {
    types: [LOGIN, LOGIN_SUCCESS, LOGIN_FAIL],
    api: fetch('http://toan.ngrok.com/oauth/token', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password: password,
        grant_type: 'password',
        client_id: 'hasbrain_tracker',
        client_secret: 'h4sbr4in',
      }),
    }),
  };
}

export function logout() {
  return { type: LOGOUT };
}

export function retrieveToken() {
  return {
    types: [RETRIEVE_TOKEN, RETRIEVE_TOKEN_SUCCESS, RETRIEVE_TOKEN_FAIL],
    promise: storage.get('token'),
  };
}

export function setToken(token) {
  return {
    types: ['SET_TOKEN', 'SET_TOKEN_SUCCESS', 'SET_TOKEN_FAIL'],
    promise: storage.set({token}),
  };
}
