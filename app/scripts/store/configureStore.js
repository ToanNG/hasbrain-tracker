import { createStore, applyMiddleware, compose } from 'redux';
import { reduxReactRouter } from 'redux-router';
import { createHistory } from 'history';
import { devTools, persistState } from 'redux-devtools';
import rootReducer from 'reducers';
import promise from 'middlewares/promise';

export default function configureStore(initialState) {
  const finalCreateStore = compose(
    applyMiddleware(promise),
    reduxReactRouter({ createHistory }),
    devTools()
  )(createStore);
  const store = finalCreateStore(rootReducer, initialState);
  return store;
}
