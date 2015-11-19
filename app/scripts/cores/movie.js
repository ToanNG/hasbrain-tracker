import {List, Map} from 'immutable';

export const INITIAL_STATE = Map();

export function setEntries(state: Map, entries: List | Array): Map {
  const list = List(entries);
  return state.set('entries', list);
}
