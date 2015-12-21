import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ImageComponent from 'components/Image';
import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardExpandable from 'material-ui/lib/card/card-expandable';
import CardHeader from 'material-ui/lib/card/card-header';
import CardMedia from 'material-ui/lib/card/card-media';
import CardText from 'material-ui/lib/card/card-text';
import CardTitle from 'material-ui/lib/card/card-title';
import FlatButton from 'material-ui/lib/flat-button';
import ListDivider from 'material-ui/lib/lists/list-divider';
import Snackbar from 'material-ui/lib/snackbar';
import * as ActivityActions from 'actions/activity';

@connect(
  mapStateToProps,
  mapDispatchToProps
)
class Home extends Component {
  componentDidMount = () => {
    this.props.actions.getTodayActivity(this.props.auth.get('token'));
  }

  _handleClickStart = () => {
    this.snackbar.show();
  }

  _handleClickUndo = () => {
    this.snackbar.dismiss();
  }

  _handleDismissSnackbar = () => {
    console.log('stop timer');
  }

  render = () => {
    const { activity } = this.props;
    const todayActivity = activity.get('todayActivity');

    if (!todayActivity) return null;

    return (
      <div className='screen'>

        <Card className='activity-card'>
          <CardMedia>
            <ImageComponent
              style={{
                width: 400,
                height: 120,
              }}
              src={todayActivity.course.cover.url} />
          </CardMedia>
          <CardTitle
            title={todayActivity.name}
            subtitle={todayActivity.course.name} />
          <CardText>
            {todayActivity.description}
          </CardText>
          <ListDivider />
          <CardActions>
            <FlatButton
              label='Learn this!'
              primary={true}
              onClick={this._handleClickStart} />
          </CardActions>
        </Card>

        <Snackbar
          ref={(node) => {
            this.snackbar = node;
          }}
          message='The activity starts after 10s'
          action='undo'
          autoHideDuration={0}
          onDismiss={this._handleDismissSnackbar}
          onActionTouchTap={this._handleClickUndo} />
      </div>
    );
  }
};

function mapStateToProps(state) {
  return {
    activity: state.activity,
    auth: state.auth,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(ActivityActions, dispatch),
  };
}

export default Home;
