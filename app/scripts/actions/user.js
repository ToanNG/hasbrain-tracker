import 'isomorphic-fetch';

import {
  API_SERVER,
  GET_USER,
  GET_USER_SUCCESS,
  GET_USER_FAIL,
} from 'constants/ActionTypes';

export function getUser(token) {
  return {
    types: [GET_USER, GET_USER_SUCCESS, GET_USER_FAIL],
    api: fetch(`${API_SERVER}/api/user/me`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  };
}
