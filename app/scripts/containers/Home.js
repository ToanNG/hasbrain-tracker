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
import FlatButton from 'material-ui/lib/flat-button';
import ListDivider from 'material-ui/lib/lists/list-divider';
import Avatar from 'material-ui/lib/avatar';
import FontIcon from 'material-ui/lib/font-icon';
import Colors from 'material-ui/lib/styles/colors';

import ImageComponent from 'components/Image';
import AnswerForm from 'components/AnswerForm';
import CountdownConfirm from 'components/CountdownConfirm';
import * as ActivityActions from 'actions/activity';

let pubnub = PUBNUB({
  publish_key: 'pub-c-f2f74db9-1fb1-4376-8f86-89013b0903fd',
  subscribe_key: 'sub-c-9f9d4258-b37e-11e5-9848-0619f8945a4f',
});

console.log('Subscribing...');
pubnub.subscribe({
  channel: 'hasbrain_test',
  message: function(message, env, ch, timer, magic_ch) {
    alert(message.text);
  },
});

@connect(
  mapStateToProps,
  mapDispatchToProps
)
class Home extends Component {
  componentDidMount = () => {
    const {auth, actions} = this.props;
    const token = auth.get('token');
    actions.getTodayActivity(token);
  }

  componentDidUpdate = () => {
    Prism.highlightAll();
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
    const {activity, actions} = this.props;
    const todayActivity = activity.get('todayActivity');
    actions.submitAnswer(todayActivity.tester, {
      targetRepo: repoUrl,
      storyId: todayActivity.storyId,
      activityNo: todayActivity.no,
    });
  }

  render = () => {
    const {activity} = this.props;
    const todayActivity = activity.get('todayActivity');

    if (!todayActivity) return null;

    const {
      course,
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
            status={'idle'}
            onSubmit={this._handleSubmit} />
        </CardText>
      </div>;
    } else {
      cardContent = <div>
        <ListDivider />
        <CardHeader
          title='Problem'
          subtitle='Try it first with all you got'
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
        <CountdownConfirm
          ref={(node) => {
            this.confirm = node;
          }}
          message={'The activity starts after [count]s'}
          action={'undo'}
          countdown={5}
          onCountdownEnd={this._handleCountdownEnd} />
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
