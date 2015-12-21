import 'isomorphic-fetch';

import { GET_TODAY_ACTIVITY, GET_TODAY_ACTIVITY_SUCCESS, GET_TODAY_ACTIVITY_FAIL } from 'constants/ActionTypes';

export function getTodayActivity(token) {
  return {
    types: [GET_TODAY_ACTIVITY, GET_TODAY_ACTIVITY_SUCCESS, GET_TODAY_ACTIVITY_FAIL],
    api: fetch('http://54.255.201.98/api/story/today', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  };
}
