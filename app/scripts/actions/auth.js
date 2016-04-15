import 'isomorphic-fetch';

import {
  API_SERVER,
  LOGIN,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  RETRIEVE_TOKEN,
  RETRIEVE_TOKEN_SUCCESS,
  RETRIEVE_TOKEN_FAIL,
  SET_TOKEN,
  SET_TOKEN_SUCCESS,
  SET_TOKEN_FAIL,
  EXCHANGE_GITHUB_TOKEN,
  EXCHANGE_GITHUB_TOKEN_SUCCESS,
  EXCHANGE_GITHUB_TOKEN_FAIL
} from 'constants/ActionTypes';
import storage from 'helpers/storage';

export function login({ email, password }) {
  return {
    types: [LOGIN, LOGIN_SUCCESS, LOGIN_FAIL],
    api: fetch(`${API_SERVER}/oauth/token`, {
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
    types: [SET_TOKEN, SET_TOKEN_SUCCESS, SET_TOKEN_FAIL],
    promise: storage.set({token}),
  };
}

export function exchangeGithubToken({ code }) {
  return dispatch => {
    fetch(`${API_SERVER}/github/exchange-token`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code
      }),
    })
    .then(response => response.json())
    .then(result => dispatch(login({
      email: 'user.github@hasbrain.com',
      password: JSON.parse(result).access_token
    })))
  };

  // return {
  //   types: [EXCHANGE_GITHUB_TOKEN, EXCHANGE_GITHUB_TOKEN_SUCCESS, EXCHANGE_GITHUB_TOKEN_FAIL],
  //   api: fetch(`${API_SERVER}/github/exchange-token`, {
  //     method: 'post',
  //     headers: {
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       code
  //     }),
  //   }),
  // };
}
