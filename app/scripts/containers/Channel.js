import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as MovieActions from 'actions/movie';

@connect(
  mapStateToProps,
  mapDispatchToProps
)
class Channel extends Component {
  static propTypes = {
    movie: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  }

  componentDidMount = () => {
    this.props.actions.fetchEntries('https://feed.theplatform.com/f/levyRC/foxplay_fmp_hl_android');
  }

  render = () => {
    const { movie, actions } = this.props;
    const entries = movie.get('entries');
    const entities = movie.get('entities');

    if (!entries) return null;

    return (
      <div className='page'>
        <h1>Channel</h1>
        <p>{movie.get('isLoading') && 'Loading...'}</p>
        <ul>
          {entries.map((entryId, key) => {
            let video = entities.videos[entryId];
            return <li key={key}>
              {video.title}
              {video.categories}
            </li>;
          })}
        </ul>
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
  };
}

export default Channel;
