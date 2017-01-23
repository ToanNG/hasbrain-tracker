import { List, Map } from 'immutable';

const INITIAL_STATE = Map({
  quiz : List()
});

export default function quiz(state = INITIAL_STATE, action){
  switch (action.type) {
    case 'GET_QUIZ':
      return state;
    case 'GET_QUIZ_SUCCESS':
      return state.merge({
        quiz: action.result
      });
    case 'GET_QUIZ_FAIL':
      return state.merge({
        quiz: []
      });
    default:
      return state;
  }
}