import 'isomorphic-fetch';

import { API_SERVER } from 'constants/ActionTypes.js';

export function get(token, activityId) {
  return {
    types: ['GET_QUIZ', 'GET_QUIZ_SUCCESS', 'GET_QUIZ_FAIL'],
    api: fetch(`${API_SERVER}/api/quiz/` + activityId, {
      method: 'get',
      headers: {
        'Authorization' : `Bearer ${token}`,
      },
    }),
  };
}