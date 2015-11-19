import * as types from 'constants/ActionTypes';

export function setEntries(entries) {
  return { type: types.SET_ENTRIES, entries };
}
