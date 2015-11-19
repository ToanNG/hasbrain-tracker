import { combineReducers } from 'redux';
import movie from 'reducers/movie';

const rootReducer = combineReducers({
  movie,
});

export default rootReducer;
