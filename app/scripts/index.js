import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ReduxRouter } from 'redux-router';
import { Route, Link } from 'react-router';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';
import App from 'containers/App';
import Home from 'containers/Home';
import Channel from 'containers/Channel';
import configureStore from 'store/configureStore';
import 'app.css';

const dest = document.getElementById('root');
const store = configureStore();
const component = (
  <ReduxRouter>
    <Route path='/' component={App}>
      <Route path='home' component={Home} />
      <Route path='channel/:id' component={Channel} />
    </Route>
  </ReduxRouter>
);

if (__DEVTOOLS__) {
  const DevTools = require('containers/DevTools');
  render(
    <Provider store={store}>
      <div>
        {component}
        <DevTools />
      </div>
    </Provider>,
    dest
  );
} else {
  render(
    <Provider store={store}>
      {component}
    </Provider>,
    dest
  );
}
