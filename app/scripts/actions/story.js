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

export function completeStory(token, activityId) {
  return {
    types: ['COMPLETE_STORY', 'COMPLETE_STORY_SUCCESS', 'COMPLETE_STORY_FAIL'],
    api: fetch(`${API_SERVER}/api/story/${activityId}/complete`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    }),
  };
}