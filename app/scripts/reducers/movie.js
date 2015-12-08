import { SET_ENTRIES, FETCH_PENDING, FETCH_SUCCESS, FETCH_FAILURE } from 'constants/ActionTypes';
import { setEntries, INITIAL_STATE } from 'cores/movie';
import { Schema, arrayOf, normalize } from 'normalizr';
import { process } from 'helpers/process-data';

const categoryMapper = {
  id: 'name',
  name: 'name',
};
const videoMapper = {
  id: 'guid',
  title: 'title',
  categories: (data) =>
    data.categories.map(category => process(category, categoryMapper)),
};
const videoSchema = new Schema('videos');
const categorySchema = new Schema('categories');
videoSchema.define({
  categories: arrayOf(categorySchema),
});

export default function movie(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_ENTRIES:
      return setEntries(state, action.entries);

    case FETCH_PENDING:
      return state.merge({ isLoading: true, entries: [] });

    case FETCH_SUCCESS:
      let entries = action.result.entries.map(entry => process(entry, videoMapper));
      let response = normalize(entries, arrayOf(videoSchema));
      return state.set('entries', response.result).set('entities', response.entities).merge({ isLoading: false });

    case FETCH_FAILURE:
      return state.merge({ isLoading: true });

    default:
      return state;
  }
}
