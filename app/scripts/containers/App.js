import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import RouteCSSTransitionGroup from 'containers/RouteCSSTransitionGroup';
import { switchTo } from 'containers/Router';

@connect(
  null,
  mapDispatchToProps
)
class App extends Component {
  _handleClickHome = (event) => {
    event.preventDefault();
    this.props.switchTo('home');
  }

  _handleClickChannel = (event) => {
    event.preventDefault();
    this.props.switchTo('channel');
  }

  render = () => {
    return (
      <div>
        <a href='#' onClick={this._handleClickHome}>
          Home
        </a>
        <a href='#' onClick={this._handleClickChannel}>
          Channel
        </a>
        <RouteCSSTransitionGroup transitionName='screen' transitionEnterTimeout={500} transitionLeaveTimeout={250}>
          {this.props.children}
        </RouteCSSTransitionGroup>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    switchTo: bindActionCreators(switchTo, dispatch),
  };
}

export default App;
