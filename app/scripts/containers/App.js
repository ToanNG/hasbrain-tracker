import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { pushState } from 'redux-router';
import RouteCSSTransitionGroup from 'containers/RouteCSSTransitionGroup';

@connect(
  null,
  mapDispatchToProps
)
class App extends Component {
  _handleClick = (event) => {
    event.preventDefault();
    this.props.pushState(null, '/channel/1');
  }

  render = () => {
    return (
      <div>
        <Link to={`/home`}>Home</Link>
        <a href='#' onClick={this._handleClick}>
          /channel/1
        </a>
        <RouteCSSTransitionGroup
          component='div' transitionName='page'
          transitionEnterTimeout={500} transitionLeaveTimeout={250}
        >
          {this.props.children}
        </RouteCSSTransitionGroup>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    pushState: bindActionCreators(pushState, dispatch),
  };
}

export default App;
