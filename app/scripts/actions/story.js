import 'isomorphic-fetch';

import { API_SERVER } from 'constants/ActionTypes';

export function getCompleteStory(token) {
  return {
    types: ['GET_COMPLETE_STORIES', 'GET_COMPLETE_STORIES_SUCCESS', 'GET_COMPLETE_STORIES_FAIL'],
    api: fetch(`${API_SERVER}/api/story/complete`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  };
}
