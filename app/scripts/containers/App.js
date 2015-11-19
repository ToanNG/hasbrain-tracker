import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as MovieActions from 'actions/movie';

class App extends Component {
  static propTypes = {
    movie: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  }

  componentDidMount = () => {
    this.props.actions.setEntries(['movie 1', 'movie 2', 'movie 3']);
  }

  render = () => {
    const { movie, actions } = this.props;

    if (!movie.get('entries')) return null;

    return (
      <ul>
        {movie.get('entries').map((entry, key) =>
          <li key={key}>{entry}</li>
        )}
      </ul>
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
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
