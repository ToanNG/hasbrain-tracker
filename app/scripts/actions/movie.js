require('isomorphic-fetch');

import { SET_ENTRIES, FETCH_PENDING, FETCH_SUCCESS, FETCH_FAILURE } from 'constants/ActionTypes';

export function setEntries(entries) {
  return { type: SET_ENTRIES, entries };
}

export function fetchEntries(url) {
  return {
    types: [FETCH_PENDING, FETCH_SUCCESS, FETCH_FAILURE],
    promise: fetch(url),
  };
}
