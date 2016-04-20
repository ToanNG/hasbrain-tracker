import 'isomorphic-fetch';

import { API_SERVER } from 'constants/ActionTypes';

export function getLearningPaths(token) {
  return {
    types: ['GET_PATHS', 'GET_PATHS_SUCCESS', 'GET_PATHS_FAIL'],
    api: fetch(`${API_SERVER}/api/learning-path/list`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  };
}
