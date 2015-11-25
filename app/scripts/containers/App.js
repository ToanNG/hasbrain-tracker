import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { pushState } from 'redux-router';
import * as MovieActions from 'actions/movie';

class App extends Component {
  static propTypes = {
    movie: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  }

  componentDidMount = () => {
    this.props.actions.fetchEntries('https://feed.theplatform.com/f/levyRC/foxplay_fmp_hl_android');
  }

  _handleClick = (event) => {
    event.preventDefault();
    this.props.pushState(null, '/channel/1');
  }

  render = () => {
    const { movie, actions } = this.props;

    if (!movie.get('entries')) return null;

    return (
      <div>
        <a href='#' onClick={this._handleClick}>
          /channel/1
        </a>
        <p>{movie.get('isLoading') && 'Loading...'}</p>
        <ul>
          {movie.get('entries').map((entry, key) =>
            <li key={key}>{entry.title}</li>
          )}
        </ul>
        {this.props.children}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    movie: state.movie,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(MovieActions, dispatch),
    pushState: bindActionCreators(pushState, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
