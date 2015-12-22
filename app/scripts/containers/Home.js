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
import RaisedButton from 'material-ui/lib/raised-button';
import ListDivider from 'material-ui/lib/lists/list-divider';
import CountdownConfirm from 'components/CountdownConfirm';
import * as ActivityActions from 'actions/activity';
import TextField from 'material-ui/lib/text-field';

const Avatar = require('material-ui/lib/avatar');
const FontIcon = require('material-ui/lib/font-icon');
const Colors = require('material-ui/lib/styles/colors');

import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';

@connect(
  mapStateToProps,
  mapDispatchToProps
)
class Home extends Component {
  componentDidMount = () => {
    this.props.actions.getTodayActivity(this.props.auth.get('token'));
  }

  componentDidUpdate = () => {
    Prism.highlightAll();
  }

  _handleClickStart = () => {
    this.confirm.show();
  }

  _handleCountdownEnd = () => {
    this.props.actions.startActivity(this.props.auth.get('token'), this.props.activity.get('todayActivity')._id);
  }

  _handleSubmit = (e) => {
    e.preventDefault();
    let repoUrl = this.repoInput.getValue();
    const {tester, storyId, no} = this.props.activity.get('todayActivity');
    this.props.actions.submitAnswer(tester, {
      targetRepo: repoUrl,
      storyId,
      activityNo: no,
    });
  }

  render = () => {
    const { activity } = this.props;
    const todayActivity = activity.get('todayActivity');

    if (!todayActivity) return null;

    const problem1 = [
      <ListDivider />,
      <CardHeader
        title='Problem'
        subtitle='Try to solve the problem before starting the activity'
        avatar={
          <Avatar
            icon={<FontIcon className='material-icons'>error</FontIcon>}
            color={Colors.red500}
            backgroundColor={Colors.grey100} />
        } />,
      <CardText dangerouslySetInnerHTML={{__html: todayActivity.problem}} />,
    ];
    const problem2 = [
      <ListDivider />,
      <CardHeader
        title='Problem'
        subtitle='Try to solve the problem again'
        avatar={
          <Avatar
            icon={<FontIcon className='material-icons'>error</FontIcon>}
            color={Colors.red500}
            backgroundColor={Colors.grey100} />
        } />,
      <CardText dangerouslySetInnerHTML={{__html: todayActivity.problem}} />,
      <CardText>
        <form onSubmit={this._handleSubmit}>
          <TextField
            ref={node => {
              this.repoInput = node;
            }}
            fullWidth={true}
            defaultValue='git@github.com:ToanNG/sample-test.git'
            hintText='Your git repo' />
          <RaisedButton type='submit' label='Submit' secondary={true} />
        </form>
      </CardText>,
    ];
    const knowledge = [
      <ListDivider />,
      <CardHeader
        title='Knowledge'
        subtitle='What you need for this activity'
        avatar={
          <Avatar
            icon={<FontIcon className='material-icons'>extension</FontIcon>}
            color={Colors.lightBlue500}
            backgroundColor={Colors.grey100} />
        } />,
      <CardText dangerouslySetInnerHTML={{__html: todayActivity.knowledge}} />,
    ];

    return (
      <div className='screen'>

        <Card className='activity-card'>
          <CardMedia>
            <ImageComponent
              style={{
                width: 592,
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

          {!todayActivity.startTime ? problem1 : null}

          {todayActivity.startTime ? [knowledge, problem2] : null}

          {
            !todayActivity.startTime ?
            [
              <ListDivider />,
              <CardActions>
                <FlatButton
                  label='Learn this!'
                  primary={true}
                  onClick={this._handleClickStart} />
              </CardActions>,
            ] : null
          }
        </Card>

        <CountdownConfirm
          ref={(node) => {
            this.confirm = node;
          }}
          message={'The activity starts after [count]s'}
          action={'undo'}
          countdown={10}
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
