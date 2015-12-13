import React from 'react';
import {createStore, combineReducers} from 'redux';
import ReactTestUtils from 'react-addons-test-utils';
import {expect} from 'chai';
import {Router, Route, IndexRoute, routerReducer, switchTo} from '../../app/scripts/containers/Router';

const {renderIntoDocument, scryRenderedDOMComponentsWithClass} = ReactTestUtils;

describe('Router', () => {

  const App = ({children}) => <div className='app'>{children}</div>;
  const Home = () => <div className='home'></div>;
  const About = () => <div className='about'></div>;
  const store = createStore(combineReducers({
    router: routerReducer,
  }));
  const router = renderIntoDocument(
    <Router store={store}>
      <Route name='app' component={App}>
        <IndexRoute component={Home} />
        <Route name='home' component={Home} setDefault/>
        <Route name='about' component={About} />
      </Route>
    </Router>
  );

  it('renders default screen', () => {
    const app = scryRenderedDOMComponentsWithClass(router, 'app');
    const home = scryRenderedDOMComponentsWithClass(router, 'home');
    const about = scryRenderedDOMComponentsWithClass(router, 'about');
    expect(app.length).to.equal(1);
    expect(home.length).to.equal(1);
    expect(about.length).to.equal(0);
  });

  it('renders other screen after switching to', () => {
    store.dispatch(switchTo('about'));
    const home = scryRenderedDOMComponentsWithClass(router, 'home');
    const about = scryRenderedDOMComponentsWithClass(router, 'about');
    expect(home.length).to.equal(0);
    expect(about.length).to.equal(1);
  });

  it('goes to the index route if the targeted route is nested', () => {
    store.dispatch(switchTo('app'));
    const home = scryRenderedDOMComponentsWithClass(router, 'home');
    expect(home.length).to.equal(1);
  });

});
