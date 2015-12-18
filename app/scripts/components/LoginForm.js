import React, { Component, PropTypes } from 'react';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';

class LoginForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    status: PropTypes.string.isRequired,
  }
  static defaultProps = { status: 'idle' }

  status = {
    idle: {
      disabled: false,
      errorText: '',
      buttonText: 'Login',
    },
    pending: {
      disabled: true,
      errorText: '',
      buttonText: 'Logging in...',
    },
    error: {
      disabled: false,
      errorText: 'Invalid email or password',
      buttonText: 'Login',
    },
  };

  _handleSubmit = (e) => {
    e.preventDefault();
    let email = this.emailInput.getValue();
    let password = this.passwordInput.getValue();
    this.props.onSubmit(email, password);
  }

  render = () => {
    const currentStatus = this.status[this.props.status] || this.status.idle;
    const {disabled, errorText, buttonText} = currentStatus;

    return (
      <form onSubmit={this._handleSubmit}>
        <TextField
          ref={node => {
            this.emailInput = node;
          }}
          disabled={disabled}
          fullWidth={true}
          errorText={errorText}
          floatingLabelText='Email' />
        <br />
        <TextField
          ref={node => {
            this.passwordInput = node;
          }}
          disabled={disabled}
          fullWidth={true}
          errorText={errorText}
          type='password'
          floatingLabelText='Password' />
        <br />
        <br />
        <RaisedButton
          disabled={disabled}
          fullWidth={true}
          secondary={true}
          type='submit'
          label={buttonText} />
      </form>
    );
  }
}

export default LoginForm;
