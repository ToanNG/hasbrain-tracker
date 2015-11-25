import { createStore, applyMiddleware, compose } from 'redux';
import { reduxReactRouter } from 'redux-router';
import { createHistory } from 'history';
import rootReducer from 'reducers';
import promise from 'middlewares/promise';

const DevTools = require('containers/DevTools');

export default function configureStore(initialState) {
  const finalCreateStore = compose(
    applyMiddleware(promise),
    reduxReactRouter({ createHistory }),
    DevTools.instrument()
  )(createStore);
  const store = finalCreateStore(rootReducer, initialState);
  return store;
}
