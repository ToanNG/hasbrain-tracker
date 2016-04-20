import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute } from 'containers/Router';
import App from 'containers/App';
import Login from 'containers/Login';
import Enroll from 'containers/Enroll';
import Home from 'containers/Home';
import configureStore from 'store/configureStore';
import injectTapEventPlugin from 'react-tap-event-plugin';
import 'loaders.css/loaders.min.css';
import 'app.css';

injectTapEventPlugin();

const dest = document.getElementById('root');
const store = configureStore();
const component = (
  <Router>
    <Route name='app' component={App} setDefault>
      <IndexRoute component={() => <div className='screen'></div>} />
      <Route name='login' component={Login} />
      <Route name='enroll' component={Enroll} />
      <Route name='home' component={Home} />
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
