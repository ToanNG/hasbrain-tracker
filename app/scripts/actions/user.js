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

export function updateLevelTips(token, levelTips){
  return {
    types: ['UPDATE_LEVELTIPS', 'UPDATE_LEVELTIPS_SUCCESS', 'UPDATE_LEVELTIPS_FAIL'],
    api: fetch(`${API_SERVER}/api/user/leveltips`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        levelTips: levelTips
      })
    })
  };
}

export function updateChaining(token, type){
  return {
    types: ['UPDATE_CHAINING', 'UPDATE_CHAINING_SUCCESS', 'UPDATE_CHAINING_FAIL'],
    api: fetch(`${API_SERVER}/api/user/chaining`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: type
      })
    })
  };
}

export function addPoints(token, point){
  return {
    types: ['ADD_POINTS', 'ADD_POINTS_SUCCESS', 'ADD_POINTS_FAIL'],
    api: fetch(`${API_SERVER}/api/user/add-points`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        point: point
      })
    })
  };
}
