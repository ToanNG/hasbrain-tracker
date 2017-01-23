import 'isomorphic-fetch';

import {
  API_SERVER,
} from 'constants/ActionTypes';

export function get(token) {
  return {
    types: ['GET_SETTINGS', 'GET_SETTINGS_SUCCESS', 'GET_SETTINGS_FAIL'],
    api: fetch(`${API_SERVER}/api/settings/get`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  };
}