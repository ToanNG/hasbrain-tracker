import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { pushState } from 'redux-router';

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
        {this.props.children}
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
