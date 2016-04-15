import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from 'reducers';
import thunk from 'redux-thunk';
import promise from 'middlewares/promise';
import api from 'middlewares/api';

const DevTools = require('containers/DevTools');

export default function configureStore(initialState) {
  const finalCreateStore = compose(
    applyMiddleware(thunk, promise, api),
    DevTools.instrument()
  )(createStore);
  const store = finalCreateStore(rootReducer, initialState);
  return store;
}
