import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';

import Card from 'material-ui/lib/card/card';
import CardMedia from 'material-ui/lib/card/card-media';
import CardTitle from 'material-ui/lib/card/card-title';
import CardHeader from 'material-ui/lib/card/card-header';
import CardText from 'material-ui/lib/card/card-text';
import CardActions from 'material-ui/lib/card/card-actions';
import ListDivider from 'material-ui/lib/lists/list-divider';
import Avatar from 'material-ui/lib/avatar';
import FontIcon from 'material-ui/lib/font-icon';
import Colors from 'material-ui/lib/styles/colors';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import RaisedButton from 'material-ui/lib/raised-button';

import ImageComponent from 'components/Image';
import AnswerForm from 'components/AnswerForm';
import CountdownConfirm from 'components/CountdownConfirm';
import * as ActivityActions from 'actions/activity';
import * as UserActions from 'actions/user';

let pubnub = PUBNUB({
  publish_key: 'pub-c-f2f74db9-1fb1-4376-8f86-89013b0903fd',
  subscribe_key: 'sub-c-9f9d4258-b37e-11e5-9848-0619f8945a4f',
});

@connect(
  mapStateToProps,
  mapDispatchToProps
)
class Home extends Component {
  state = {
    openDialog: false,
    dialogMessage: null,
  }

  componentDidMount = () => {
    this._getTodayActivity();
    this._getUser();
  }

  componentDidUpdate = () => {
    Prism.highlightAll();
  }

  componentWillReceiveProps = (nextProps) => {
    const thisUser = this.props.user.get('currentUser');
    const nextUser = nextProps.user.get('currentUser');

    if (nextUser !== thisUser && nextUser) {
      console.log(`Subscribing to channel hasbrain_test_${nextUser._id}...`);
      pubnub.subscribe({
        channel: `hasbrain_test_${nextUser._id}`,
        message: (message, env, ch, timer, magic_ch) => {
          this._handleOpenDialog(message.text);
        },
      });
    }
  }

  _getTodayActivity = () => {
    const {auth, actions} = this.props;
    const token = auth.get('token');
    actions.getTodayActivity(token);
  }

  _getUser = () => {
    const {auth, userActions} = this.props;
    const token = auth.get('token');
    userActions.getUser(token); 
  }

  _handleClickStart = () => {
    this.confirm.show();
  }

  _handleCountdownEnd = () => {
    const {auth, activity, actions} = this.props;
    const token = auth.get('token');
    const todayActivity = activity.get('todayActivity');
    actions.startActivity(token, todayActivity._id);
  }

  _handleSubmit = (repoUrl) => {
    const {auth, activity, actions} = this.props;
    const token = auth.get('token');
    const todayActivity = activity.get('todayActivity');
    actions.submitAnswer(token, todayActivity.storyId, repoUrl);
  }

  _handleOpenDialog = (message) => {
    this.setState({openDialog: true, dialogMessage: message});
  }

  _handleCloseDialog = () => {
    this._getTodayActivity();
    this.setState({openDialog: false, dialogMessage: null});
  }

  render = () => {
    const {activity, user} = this.props;
    const todayActivity = activity.get('todayActivity');
    const isSubmitting = activity.get('isSubmitting');
    const currentUser = user.get('currentUser');

    if (!todayActivity || !currentUser) return null;

    const {
      company,
      parent: course,
      name,
      description,
      problem,
      knowledge,
      startTime: isStarted,
    } = todayActivity;
    let cardContent;

    if (isStarted) {
      cardContent = <div>
        <ListDivider />
        <CardHeader
          title='Knowledge'
          subtitle='What you need to finish this activity'
          avatar={
            <Avatar
              icon={<FontIcon className='material-icons'>extension</FontIcon>}
              color={Colors.lightBlue500}
              backgroundColor={Colors.grey100} />
          } />
        <CardText dangerouslySetInnerHTML={{__html: knowledge}} />
        <ListDivider />
        <CardHeader
          title='Practice'
          subtitle='Solve the problem again'
          avatar={
            <Avatar
              icon={<FontIcon className='material-icons'>vpn_key</FontIcon>}
              color={Colors.green500}
              backgroundColor={Colors.grey100} />
          } />
        <CardText>
          <div dangerouslySetInnerHTML={{__html: problem}} />
          <AnswerForm
            status={isSubmitting ? 'pending' : 'idle'}
            onSubmit={this._handleSubmit} />
        </CardText>
      </div>;
    } else {
      cardContent = <div>
        <ListDivider />
        <CardHeader
          title='Challenge'
          subtitle={
            company
            ? <span>Contributed by <a href={`mailto:${company.email}`}>{company.name}</a></span>
            : 'Try it first with all you got'
          }
          avatar={
            <Avatar
              icon={<FontIcon className='material-icons'>error</FontIcon>}
              color={Colors.red500}
              backgroundColor={Colors.grey100} />
          } />
        <CardText dangerouslySetInnerHTML={{__html: problem}} />
        <ListDivider />
        <CardActions>
          <FlatButton
            label='Learn this!'
            primary={true}
            onClick={this._handleClickStart} />
        </CardActions>
      </div>;
    }

    return (
      <div className='screen'>
        <ImageComponent className='wallpaper' src='https://d13yacurqjgara.cloudfront.net/users/64177/screenshots/2635137/simonas-maciulis_space2.png' />
        <div style={{position: 'relative'}}>
          <Card className='activity-card'>
            <CardMedia>
              <ImageComponent
                style={{
                  width: 592,
                  height: 120,
                }}
                src={course.cover.url} />
            </CardMedia>
            <CardTitle
              title={name}
              subtitle={course.name} />
            <CardText>
              {description}
            </CardText>
            {cardContent}
          </Card>
        </div>
        <CountdownConfirm
          ref={(node) => {
            this.confirm = node;
          }}
          message={'The activity starts after [count]s'}
          action={'undo'}
          countdown={5}
          onCountdownEnd={this._handleCountdownEnd} />
        <Dialog
          title='Dialog With Actions'
          actions={[
            <FlatButton
              label='Cancel'
              secondary={true}
              onTouchTap={this._handleCloseDialog} />,
            <FlatButton
              label='Submit'
              primary={true}
              keyboardFocused={true}
              onTouchTap={this._handleCloseDialog} />,
          ]}
          modal={true}
          open={this.state.openDialog}>
          {this.state.dialogMessage}
        </Dialog>
      </div>
    );
  }
};

function mapStateToProps(state) {
  return {
    activity: state.activity,
    auth: state.auth,
    user: state.user,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(ActivityActions, dispatch),
    userActions: bindActionCreators(UserActions, dispatch),
  };
}

export default Home;
