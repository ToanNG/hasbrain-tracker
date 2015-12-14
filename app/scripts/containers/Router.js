import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { List, Map } from 'immutable';

const INITIAL_STATE = Map({
  currentScreen: null,
});

// <Router> component
@connect(
  (state) => ({
    router: state.router,
  })
)
class Router extends Component {
  static childContextTypes = {
    screen: PropTypes.string,
  }

  getChildContext = () => ({
    screen: this.props.router.get('currentScreen'),
  })

  state = {
    routeMap: null,
  }

  componentWillMount = () => this.setState({
    routeMap: this._constructRouteMap(this.props.children),
  })

  _constructRouteMap = (component, map = {}, tracker = []) => {
    if (!component) return;

    if (component.length) {
      component.forEach((c) => {
        this._constructRouteMap(c, map, tracker);
      });
    }

    if (component.type === Route) {
      let {name, setDefault, children} = component.props;
      let updatedTracker = [...tracker, name];
      map[name] = updatedTracker;

      if (setDefault) {
        map.default = updatedTracker;
      }

      this._constructRouteMap(children, map, updatedTracker);
    }

    return map;
  }

  _constructComponent = (component, path = []) => {
    if (!component) return undefined;

    if (!path.length) {
      if (component.length) {
        return component.find((c) => {
          return c.type === IndexRoute;
        });
      }

      return component.type === IndexRoute ? component : undefined;
    }

    if (component.length) {
      component = component.find((c) => {
        return c.props.name === path[0];
      });
    }

    return {
      ...component,
      props: {
        ...component.props,
        children: this._constructComponent(component.props.children, path.slice(1)),
      },
    };
  }

  render = () => {
    const { router, children } = this.props;
    const { routeMap } = this.state;
    const currentScreen = router.get('currentScreen');

    return (
      <div>
        {this._constructComponent(children, routeMap[currentScreen] || routeMap.default)}
      </div>
    );
  }
}

// <IndexRoute> component
const IndexRoute = ({component}) => (
  <div>
    {React.createElement(component)}
  </div>
);

// <Route> component
const Route = ({component, children}) => (
  <div>
    {React.createElement(component, null, children)}
  </div>
);

// reducer
const routerReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'SET_CURRENT_SCREEN':
      return state.set('currentScreen', action.screenName);

    default:
      return state;
  }
};

// action creator
const switchTo = (screenName) => ({
  type: 'SET_CURRENT_SCREEN',
  screenName: screenName,
});

export { Router, Route, IndexRoute, routerReducer, switchTo };
