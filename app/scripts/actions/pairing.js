import 'isomorphic-fetch';

import { API_SERVER } from 'constants/ActionTypes.js';

export function getPartner(token, activityId) {
  return {
    types: ['GET_PARTNER', 'GET_PARTNER_SUCCESS', 'GET_PARTNER_FAIL'],
    api: fetch(`${API_SERVER}/api/pairing/me`, {
      method: 'get',
      headers: {
        'Authorization' : `Bearer ${token}`,
      },
    }),
  };
}