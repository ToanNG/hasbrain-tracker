import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Paper from 'material-ui/lib/paper';
import RadioButton from 'material-ui/lib/radio-button';
import RadioButtonGroup from 'material-ui/lib/radio-button-group';
import RaisedButton from 'material-ui/lib/raised-button';
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
    selectedPath: null
  }

  componentDidMount = () => {
    this._getLearningPaths();
  }

  _getLearningPaths = () => {
    const {auth, pathActions} = this.props;
    const token = auth.get('token');
    pathActions.getLearningPaths(token);
  }

  _handleChange = (e, value) => {
    this.setState({
      selectedPath: value
    });
  }

  _handleSubmit = () => {
    const {auth, enrollmentActions} = this.props;
    const token = auth.get('token');
    enrollmentActions.enroll(token, this.state.selectedPath);
  }

  render = () => {
    const styles = {
      radioButton: {
        marginLeft: 8,
        marginBottom: 16
      },
    };

    return (
      <div className='screen'>
        <ImageComponent className='wallpaper' src='https://d13yacurqjgara.cloudfront.net/users/43762/screenshots/1438974/ng-colab-space_night.gif' />
        <Paper className='enroll' zDepth={1}>
          <h2>Select your path</h2>
          <RadioButtonGroup
            name='path'
            onChange={this._handleChange}
          >
            {this.props.learningPath.get('paths').map(path =>
              <RadioButton
                value={path.get('_id')}
                label={path.get('name')}
                style={styles.radioButton}
              />
            )}
          </RadioButtonGroup>
          <RaisedButton
            fullWidth={true}
            secondary={true}
            label='Submit'
            onTouchTap={this._handleSubmit}
          />
        </Paper>
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
