import React, { Component, PropTypes } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import StaticContainer from 'react-static-container';

class RouteCSSTransitionGroup extends Component {
  static contextTypes = {
    screen: PropTypes.string,
  }

  state = {
    previousScreen: null,
  }

  componentWillReceiveProps = (nextProps, nextContext) => {
    if (nextContext.screen !== this.context.screen) {
      this.setState({ previousScreen: this.context.screen });
    }
  }

  render = () => {
    const { children, ...props } = this.props;
    const { previousScreen } = this.state;

    return (
      <ReactCSSTransitionGroup {...props}>
        <StaticContainer
          key={previousScreen || this.context.screen}
          shouldUpdate={!previousScreen}
        >
          {children}
        </StaticContainer>
      </ReactCSSTransitionGroup>
    );
  }

  componentDidUpdate = () => {
    if (this.state.previousScreen) {
      this.setState({ previousScreen: null });
    }
  }
}

export default RouteCSSTransitionGroup;
