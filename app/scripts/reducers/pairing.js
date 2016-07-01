import { List, Map } from 'immutable';

const INITIAL_STATE = Map({
  pairing : null
});

export default function pairing(state = INITIAL_STATE, action){
  switch (action.type) {
    case 'GET_PARTNER':
      return state;
    case 'GET_PARTNER_SUCCESS':
      return state.set('pairing', action.result);
    case 'GET_PARTNER_FAIL':
      return state.set('pairing', null);
    default:
      return state;
  }
}