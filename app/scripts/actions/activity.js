import 'isomorphic-fetch';

import {
  API_SERVER,
  GET_TODAY_ACTIVITY,
  GET_TODAY_ACTIVITY_SUCCESS,
  GET_TODAY_ACTIVITY_FAIL,
  START_ACTIVITY,
  START_ACTIVITY_SUCCESS,
  START_ACTIVITY_FAIL,
  SUBMIT_ANSWER,
  SUBMIT_ANSWER_SUCCESS,
  SUBMIT_ANSWER_FAIL,
} from 'constants/ActionTypes';

export function getTodayActivity(token) {
  return {
    types: [GET_TODAY_ACTIVITY, GET_TODAY_ACTIVITY_SUCCESS, GET_TODAY_ACTIVITY_FAIL],
    api: fetch(`${API_SERVER}/api/story/today`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  };
}

export function startActivity(token, activityId) {
  return {
    types: [START_ACTIVITY, START_ACTIVITY_SUCCESS, START_ACTIVITY_FAIL],
    api: fetch(`${API_SERVER}/api/story/create`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        activity: activityId,
      }),
    }),
  };
}

export function submitAnswer(token, storyId, targetRepo) {
  return {
    types: [SUBMIT_ANSWER, SUBMIT_ANSWER_SUCCESS, SUBMIT_ANSWER_FAIL],
    api: fetch(`${API_SERVER}/api/circle/build`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        story: storyId,
        repo: targetRepo,
      }),
    }),
  };
}
