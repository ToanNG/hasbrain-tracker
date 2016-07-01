import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Snackbar from 'material-ui/lib/snackbar';

class Pomodoro extends Component {
  _handleActionTouchTap = () => {
    this.snackbar.dismiss();
  }

  _handleDismiss = () => {
    clearInterval(this.interval);
  }

  _handleShow = () => {
    let {message, countdown: count, onCountdownEnd} = this.props;
    let elem = ReactDOM.findDOMNode(this.snackbar).getElementsByTagName('span')[0];
    let updateMessage = () => {
      if (count < 0) {
        this.snackbar.dismiss();
        return onCountdownEnd();
      }
      elem.innerHTML = message.replace('[count]', count--);
      return updateMessage;
    };

    clearInterval(this.interval);
    this.interval = setInterval(updateMessage(), 1000);
  }

  show = () => {
    this.snackbar.show();
  }

  dismiss = () => {
    this.snackbar.dismiss();
  }

  render = () => {
    const {action, countdown} = this.props;

    return (
      <Snackbar
        ref={(node) => {
          this.snackbar = node;
        }}
        open={true}
        message='Pomodoro times'
        action={action}
        autoHideDuration={0}
        onActionTouchTap={this._handleActionTouchTap} />
    );
  }
}

export default Pomodoro;