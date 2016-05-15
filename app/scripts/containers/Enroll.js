import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import Paper from 'material-ui/lib/paper';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import ImageComponent from 'components/Image';
import * as EnrollmentActions from 'actions/enrollment';
import * as LearningPathActions from 'actions/learningPath';

@connect(
  mapStateToProps,
  mapDispatchToProps
)
class Enroll extends Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
    learningPath: PropTypes.object.isRequired,
    enrollmentActions: PropTypes.object.isRequired,
    pathActions: PropTypes.object.isRequired,
  }

  state = {
    openDialog: false,
    selectedPath: Map()
  }

  componentDidMount = () => {
    this._getLearningPaths();
  }

  _getLearningPaths = () => {
    const {auth, pathActions} = this.props;
    const token = auth.get('token');
    pathActions.getLearningPaths(token);
  }

  _handleTouchTap = (value, e) => {
    this.setState({
      openDialog: true,
      selectedPath: value
    });
  }

  _handleSubmit = () => {
    const {auth, enrollmentActions} = this.props;
    const token = auth.get('token');
    enrollmentActions.enroll(token, this.state.selectedPath.get('_id'));
  }

  _handleClose = () => {
    this.setState({
      openDialog: false
    });
  }

  render = () => {
    const { openDialog, selectedPath } = this.state;
    const { learningPath } = this.props;
    const actions = [
      <FlatButton
        label='Cancel'
        secondary={true}
        onTouchTap={this._handleClose}
      />,
      <FlatButton
        label={`Pick ${selectedPath.get('name')}`}
        primary={true}
        keyboardFocused={true}
        onTouchTap={this._handleSubmit}
      />
    ];

    return (
      <div className='screen'>
        <ImageComponent className='wallpaper' src='https://d13yacurqjgara.cloudfront.net/users/43762/screenshots/1438974/ng-colab-space_night.gif' />
        <Paper className='enroll' zDepth={1}>
          <h2>Pick your path</h2>
          <List>
            {learningPath.get('paths').map(path =>
              <ListItem
                primaryText={path.get('name')}
                onTouchTap={this._handleTouchTap.bind(null, path)}
              />
            )}
          </List>
        </Paper>

        <Dialog
          actions={actions}
          modal={false}
          open={openDialog}
          onRequestClose={this._handleClose}
        >
          <iframe
            width='100%'
            height='480'
            src={`https://coggle.it/diagram/${selectedPath.get('diagram')}`}
            frameBorder='0'
            allowFullScreen=''
          />
        </Dialog>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    learningPath: state.learningPath,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    enrollmentActions: bindActionCreators(EnrollmentActions, dispatch),
    pathActions: bindActionCreators(LearningPathActions, dispatch)
  };
}

export default Enroll;
