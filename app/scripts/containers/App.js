import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import RouteCSSTransitionGroup from 'containers/RouteCSSTransitionGroup';
import { switchTo } from 'containers/Router';
import ImageComponent from 'components/Image';
import * as AuthActions from 'actions/auth';

@connect(
  mapStateToProps,
  mapDispatchToProps
)
class App extends Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
    switchTo: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
  }

  componentDidMount = () => {
    this.props.actions.retrieveToken();
  }

  componentWillReceiveProps = (nextProps, nextContext) => {
    const {switchTo, actions} = this.props;

    if (this.props.auth.get('isLoggedIn') !== nextProps.auth.get('isLoggedIn')) {
      if (nextProps.auth.get('isLoggedIn')) {
        actions.setToken(nextProps.auth.get('token'));
        switchTo('home');
      } else {
        switchTo('login');
      }
    }
  }

  render = () => {
    return (
      <div>
        <ImageComponent className='wallpaper' src='https://images.unsplash.com/photo-1428535172630-fb1c050ac3e0?crop=entropy&fit=crop&fm=jpg&h=750&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=1450' />
        <RouteCSSTransitionGroup transitionName='screen' transitionEnterTimeout={500} transitionLeaveTimeout={250}>
          {this.props.children}
        </RouteCSSTransitionGroup>

        <footer className='footer'>
          <small>&copy; 2015 hasBrain</small>
        </footer>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    switchTo: bindActionCreators(switchTo, dispatch),
    actions: bindActionCreators(AuthActions, dispatch),
  };
}

export default App;
