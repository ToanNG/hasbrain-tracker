import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Paper from 'material-ui/lib/paper';
import LoginForm from 'components/LoginForm';
import LoginGithub from 'components/LoginGithub';
import ImageComponent from 'components/Image';
import * as AuthActions from 'actions/auth';
import { generateCode } from 'utils';
import { API_SERVER } from 'constants/ActionTypes';

@connect(
  mapStateToProps,
  mapDispatchToProps
)
class Login extends Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  }

  _handleSubmit = (email, password) => {
    this.props.actions.login({email, password});
  }

  _handleGithubLogin = () => {
    const code = generateCode(10);
    const redirectUri = `${API_SERVER}/github/callback?c=${code}`;
    const win = window.open(
      `https://github.com/login/oauth/authorize?scope=user:email&client_id=472d3f7775e7e51c6660&redirect_uri=${encodeURIComponent(redirectUri)}`,
      'Login with Github',
      'height=603,width=1020'
    );

    const windowClosed = setInterval(() => {
      if (win.closed) {
        this.props.actions.exchangeGithubToken({code});
        clearInterval(windowClosed);
      }
    }, 250);
  }

  render = () => {
    const {auth} = this.props;
    let status = 'idle';

    if (auth.get('error')) {
      status = 'error';
    } else if (auth.get('isLoggingIn')) {
      status = 'pending';
    }

    return (
      <div className='screen'>
        <ImageComponent className='wallpaper' src='https://d13yacurqjgara.cloudfront.net/users/43762/screenshots/1438974/ng-colab-space_night.gif' />
        <Paper className='login' zDepth={1}>
          <img className='logo' src={require('logo-notext.png')} />
          <LoginForm status={status} onSubmit={this._handleSubmit} />
          <p className='or'><small>or</small></p>
          <LoginGithub status={status} onTouchTap={this._handleGithubLogin} />
          <p><small>hasBrain helps you improve your learning process.</small></p>
        </Paper>
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
    actions: bindActionCreators(AuthActions, dispatch),
  };
}

export default Login;
