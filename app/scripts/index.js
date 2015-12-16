import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';
import { Router, Route, IndexRoute } from 'containers/Router';
import App from 'containers/App';
import Login from 'containers/Login';
import Home from 'containers/Home';
import Channel from 'containers/Channel';
import configureStore from 'store/configureStore';
import 'loaders.css/loaders.min.css';
import 'app.css';

const dest = document.getElementById('root');
const store = configureStore();
const component = (
  <Router>
    <Route name='app' component={App} setDefault>
      <IndexRoute component={() => <div className='screen'>Loading...</div>} />
      <Route name='login' component={Login} />
      <Route name='home' component={Home} />
      <Route name='channel' component={Channel} />
    </Route>
  </Router>
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
