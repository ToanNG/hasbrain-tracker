import { createStore, applyMiddleware } from 'redux';
import rootReducer from 'reducers';
import promise from 'middlewares/promise';

export default function configureStore(initialState) {
  let createStoreWithMiddleware = applyMiddleware(promise)(createStore);
  const store = createStoreWithMiddleware(rootReducer, initialState);
  return store;
}
