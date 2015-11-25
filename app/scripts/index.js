import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ReduxRouter } from 'redux-router';
import { Route, Link } from 'react-router';
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';
import App from 'containers/App';
import Channel from 'pages/Channel';
import configureStore from 'store/configureStore';
import 'app.css';

const store = configureStore();

render(
  <div>
    <Provider store={store}>
      <ReduxRouter>
        <Route path='/' component={App}>
          <Route path='channel/:id' component={Channel} />
        </Route>
      </ReduxRouter>
    </Provider>
    <DebugPanel top right bottom>
      <DevTools store={store} monitor={LogMonitor} />
    </DebugPanel>
  </div>,
  document.getElementById('root')
);
