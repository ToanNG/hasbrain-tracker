import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Snackbar from 'material-ui/lib/snackbar';

class CountdownConfirm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  _handleShow = () => {
    let {message, countdown: count, onCountdownEnd} = this.props;
    let elem = ReactDOM.findDOMNode(this.snackbar).getElementsByTagName('span')[0];
    let updateMessage = () => {
      if (count < 0) {
        this.dismiss();
        return onCountdownEnd();
      }
      elem.innerHTML = message.replace('[count]', count--);
      return updateMessage;
    };

    clearInterval(this.interval);
    this.interval = setInterval(updateMessage(), 1000);
  }

  show = () => {
    this.setState({ open: true });
  }

  dismiss = () => {
    this.setState({ open: false });
    clearInterval(this.interval);
  }

  stop = () => {
    clearInterval(this.interval);
  }

  handleRequestClose = (reason) => {
    if (reason !== 'clickaway') {
      this.dismiss();
    }
  }

  handleActionTouchTap = () => {
    this.setState({ open: false });
  }

  render = () => {
    const { action, message } = this.props;

    return (
      <Snackbar
        ref={(node) => {
          this.snackbar = node;
        }}
        open={this.state.open}
        message=''
        action={action}
        autoHideDuration={0}
        onActionTouchTap={this.handleActionTouchTap}
        onRequestClose={this.handleRequestClose}
        style={{zIndex: 1000}} />
    );
  }
}

export default CountdownConfirm;
