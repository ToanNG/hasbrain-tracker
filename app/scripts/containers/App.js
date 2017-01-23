import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import RouteCSSTransitionGroup from 'containers/RouteCSSTransitionGroup';
import { switchTo } from 'containers/Router';
import ImageComponent from 'components/Image';
import * as AuthActions from 'actions/auth';
import * as UserActions from 'actions/user';
import FontIcon from 'material-ui/lib/font-icon';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';

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
    const { auth: thisAuth, user: thisUser, switchTo, actions} = this.props;
    const { auth: nextAuth, user: nextUser } = nextProps;

    if (thisAuth.get('isLoggedIn') !== nextAuth.get('isLoggedIn')) {
      if (nextAuth.get('isLoggedIn')) {
        actions.setToken(nextAuth.get('token'));
        const {userActions} = this.props;
        const token = nextAuth.get('token');
        userActions.getUser(token);
      } else {
        switchTo('login');
      }
    }

    if (thisUser.get('currentUser') !== nextUser.get('currentUser') && nextUser.get('currentUser')) {
      if (!nextUser.get('currentUser').enrollments) {
        switchTo('enroll');
      } else {
        switchTo('home');
      }
    }
  }

  render = () => {
    return (
      <div>
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
    user: state.user,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    switchTo: bindActionCreators(switchTo, dispatch),
    actions: bindActionCreators(AuthActions, dispatch),
    userActions: bindActionCreators(UserActions, dispatch),
  };
}

export default App;
