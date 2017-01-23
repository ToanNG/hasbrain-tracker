import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import Shepherd from 'tether-shepherd';
import ReactDisqusThread from 'react-disqus-thread';
import { parseString } from 'xml2js';

import Card from 'material-ui/lib/card/card';
import CardMedia from 'material-ui/lib/card/card-media';
import CardTitle from 'material-ui/lib/card/card-title';
import CardHeader from 'material-ui/lib/card/card-header';
import CardText from 'material-ui/lib/card/card-text';
import CardActions from 'material-ui/lib/card/card-actions';
import Divider from 'material-ui/lib/divider';
import Avatar from 'material-ui/lib/avatar';
import FontIcon from 'material-ui/lib/font-icon';
import Colors from 'material-ui/lib/styles/colors';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import RaisedButton from 'material-ui/lib/raised-button';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import Snackbar from 'material-ui/lib/snackbar';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';

import ImageComponent from 'components/Image';
import AnswerForm from 'components/AnswerForm';
import CountdownConfirm from 'components/CountdownConfirm';
import Pomodoro from 'components/Pomodoro';
import D3Tree from 'components/D3Tree';
import Quiz from 'components/Quiz';
import * as ActivityActions from 'actions/activity';
import * as UserActions from 'actions/user';
import * as StoryActions from 'actions/story';
import * as PathActions from 'actions/learningPath';
import * as PairingActions from 'actions/pairing';
import * as QuizActions from 'actions/quiz';
import * as SettingsActions from 'actions/settings';

@connect(
  mapStateToProps,
  mapDispatchToProps
)
class Home extends Component {
  state = {
    openDialog: false,
    openShowMapDialog: false,
    openGiveUpDialog: false,
    openSelectAnotherNode: false,
    dialogMessage: null,
    showLearningTree : false,
    openMoveToKnowledgeDialog : false,
    displayMoveToKnowledgeButton : false,
    countdown: 1500,
    tour: new Shepherd.Tour({
        defaults: {
            classes: 'shepherd-theme-arrows',
            scrollTo: true,
            showCancelLink: true
        }
    }),
    isSubmitting: false,
    startWorkingTime: 0
  }

  componentDidMount = () => {
    this.setState({startWorkingTime: new Date().getTime()});
    this._getUser();
    this._getTodayActivity();
    this._getStory();
    this._getPath();
    this._getPartner();
    window.addEventListener('message', this._handleReceiveMessage);
    window.addEventListener('beforeunload', this._handleSetWorkingTimeBeforeLeaving);
  }

  _handleReceiveMessage = (event) => {
    if (event.origin === 'http://hasbrain.com') {
      UserKit.track('comment', {timestamp: new Date().getTime(), disqusCommentId: event.data.id, text: event.data.text});
    }
  }

  _handleSetWorkingTimeBeforeLeaving = () => {
    const {auth, storyActions, activity} = this.props;
    const { startWorkingTime } = this.state;
    const todayActivity = activity.get('todayActivity');
    const token = auth.get('token');
    let currentTime = new Date().getTime();
    let workingTime = (currentTime - startWorkingTime)/1000;
    storyActions.addWorkingTime(token, todayActivity.storyId, workingTime);
  }

  componentWillUnmount = () => {
    window.removeEventListener('message', this._handleReceiveMessage);
    window.removeEventListener('beforeunload', this._handleSetWorkingTimeBeforeLeaving);
  }

  componentDidUpdate = () => {
    Prism.highlightAll();
  }

  componentWillReceiveProps = (nextProps) => {
    let tempActivity = null, tempUser = null;

    const thisUser = this.props.user.get('currentUser');
    const nextUser = nextProps.user.get('currentUser');
    if (nextUser !== thisUser && nextUser) {
      tempUser = nextUser;

      let oldUser = UserKit.getCurrentProfile();
      let name = '';
      if(nextUser.name && nextUser.name.first && nextUser.name.last) {
          name = nextUser.name.first + ' ' + nextUser.name.last;
      }
      UserKit.createNewProfile(nextUser._id, { email: nextUser.email, name: name }, function(){
        let curUser = UserKit.getCurrentProfile();
        if(oldUser !== curUser) {
          UserKit.alias(oldUser, function(){
            console.log('Created alias successfully!');
          });
        }
        console.log('Profile ID: ', curUser);
      });
    }

    const thisActivity = this.props.activity.get('todayActivity');
    const nextActivity = nextProps.activity.get('todayActivity');
    if(thisActivity !== nextActivity && nextActivity){
      tempActivity = nextActivity;

      // const { auth, quizActions } = this.props;
      // const token = auth.get('token');
      // quizActions.get(token, tempActivity._id); // Get quiz list by activity id
    }

    if(!tempUser) { tempUser = thisUser; }
    if(!tempActivity){ tempActivity = thisActivity; }
    if(tempUser && tempActivity) {
      if(tempActivity.tester && !tempActivity.showKnowledge && !this.state.displayMoveToKnowledgeButton){
        // this._countDown();
      }
    }

    if(tempUser.enrollments && tempUser.levelTips === 1 && tempActivity) { // Avoid to run this code in enroll screen
      // const { tour } = this.state;

      // // tour.on('complete', function(){
      // //     tour.getById('CourseName').destroy();
      // //     // const token = auth.get('token');
      // //     // userActions.updateLevelTips(token, 1);
      // // });

      // tour.addStep('CourseName', {
      //   title: 'Node name',
      //   text: 'This is the name of current learning node.',
      //   attachTo: {element: 'body', on: 'left'},
      //   buttons: [
      //     {
      //       text: 'Next',
      //       action: tour.next,
      //       classes: 'shepherd-button-example-primary'
      //     }
      //   ]
      // });

      // tour.start();
    }

    const thisCheck = this.props.activity.get('finishGettingTodayActivity');
    const nextCheck = nextProps.activity.get('finishGettingTodayActivity');
    if(thisCheck !== nextCheck && nextCheck){
      if(!nextActivity || !thisActivity){
        if(typeof this.state.showLearningTree !== undefined ) {
          this.setState({ showLearningTree: true }); // Display learning tree if don't have current node
        }
      }
    }
  }

  _getTodayActivity = () => {
    const {auth, actions} = this.props;
    const token = auth.get('token');
    actions.getTodayActivity(token);
  }

  _getUser = () => {
    const {auth, userActions, settingsActions} = this.props;
    const token = auth.get('token');
    userActions.getUser(token);
    settingsActions.get(token);
  }

  _getStory = () => {
    const {auth, storyActions} = this.props;
    const token = auth.get('token');
    storyActions.getCompleteStory(token);
  }

  _getPath = () => {
    const {auth, pathActions} = this.props;
    const token = auth.get('token');
    pathActions.getLearningPath(token);
  }

  _getPartner = () => {
    const { auth, pairingActions } = this.props;
    const token = auth.get('token');
    pairingActions.getPartner(token);
  }

  _countDown = () => {
    let { countdown } = this.state;
    if(ReactDOM.findDOMNode(this.confirm)) {
      let message = 'You will be prompted to move onto the knowledge part in [count]';
      let elem = ReactDOM.findDOMNode(this.confirm).getElementsByTagName('span')[0];
      let updateMessage = () => {
        if (countdown <= 0) {
          this.confirm.dismiss();
          clearInterval(this.interval);
          this._handleCountdownKnowledgePartEnd();
          return;
        }
        countdown = countdown - 1;
        elem.innerHTML = message.replace('[count]', this._secondsToHms(countdown));
        this.setState({countdown: countdown});
        return updateMessage;
      };

      clearInterval(this.interval);
      this.interval = setInterval(updateMessage(), 1000);
      this.confirm.show();
    }
  }

  _secondsToHms = (d) => {
    d = Number(d);
    let h = Math.floor(d / 3600);
    let m = Math.floor(d % 3600 / 60);
    let s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
  }

  _handleClickLearnThis = () => {
    const {auth, activity, actions} = this.props;
    const token = auth.get('token');
    const todayActivity = activity.get('todayActivity');
    actions.showKnowledge(token, todayActivity._id);
  }

  _handleCountdownEnd = () => {
    const {auth, activity, actions} = this.props;
    const token = auth.get('token');
    const todayActivity = activity.get('todayActivity');
    actions.startActivity(token, todayActivity._id);
  }

  _handleCountdownKnowledgePartEnd = () => {
    // const { activity } = this.props;
    // const isSubmitting = activity.get('isSubmitting');
    // if(!isSubmitting) {
      this.setState({displayMoveToKnowledgeButton : true});
    //}
  }

  _handleSubmit = (repoUrl) => {
    const {auth, activity, user, actions, storyActions, userActions} = this.props;
    const token = auth.get('token');
    let self = this;
    const todayActivity = activity.get('todayActivity');
    const currentUser = user.get('currentUser');
    self.setState({isSubmitting: true});

    // Determine that which learning path are learning for choosing the right test server
    if(todayActivity.learningPath._id == '58130aa6c0c71fa70567ec09') { // C++
      actions.submitAnswerCpp(token, currentUser._id, todayActivity.activityId, repoUrl).then(function(res){
        parseString(res, function (err, result) {
          if(result.Catch.OverallResults[0].$.successes == 0 && result.Catch.OverallResults[0].$.failures == 1){
            throw new Error('Test fail');
          } else if(result.Catch.OverallResults[0].$.successes == 5 && result.Catch.OverallResults[0].$.failures == 0){
            storyActions.setCompleteStory(token, todayActivity.storyId).then((status)=>{
              if(status === 200){
                self.setState({openMoveToKnowledgeDialog : true, isSubmitting: false}, ()=>{
                  UserKit.track('submit', {status: "success", timestamp: new Date().getTime(), activity_id: todayActivity._id});
                  self.confirm.dismiss();
                });
              } else {
                self.setState({isSubmitting: false}, () => {
                  UserKit.track('submit', {status: "failure", timestamp: new Date().getTime(), activity_id: todayActivity._id});
                  self._handleOpenDialog('Test fails! Please try again.');
                  userActions.updateChaining(token, 'reset');
                });
              }
            });
          } else {
            throw new Error('Unexpected Error!');
          }
        });
      }).catch((err)=>{
        this.setState({isSubmitting: false}, ()=>{
          UserKit.track('submit', {status: "failure", timestamp: new Date().getTime(), activity_id: todayActivity._id});
          this._handleOpenDialog(err.message);
          userActions.updateChaining(token, 'reset');
        });
      });
    } else if(todayActivity.learningPath._id == '5815923cc0c71fa70567ec1a') { // java
      actions.submitAnswerJava(token, currentUser._id, todayActivity.activityId, repoUrl).then(function(res){
        let lines = res.split('\n');
        if ( lines[4].indexOf( 'OK' ) > -1 ) {
          storyActions.setCompleteStory(token, todayActivity.storyId).then((status)=>{
            if(status === 200){
              self.setState({openMoveToKnowledgeDialog : true, isSubmitting: false}, ()=>{
                UserKit.track('submit', {status: "success", timestamp: new Date().getTime(), activity_id: todayActivity._id});
                self.confirm.dismiss();
              });
            } else {
              self.setState({isSubmitting: false}, () => {
                UserKit.track('submit', {status: "failure", timestamp: new Date().getTime(), activity_id: todayActivity._id});
                self._handleOpenDialog('Test fails! Please try again.');
                userActions.updateChaining(token, 'reset');
              });
            }
          });
        } else {
          let ret = '';
          for(let i = 3; i < (lines.length - 5); i++){
            ret += '\n' + lines[i];
          }
          throw new Error(ret);
        }
      }).catch((err)=>{
        this.setState({isSubmitting: false}, ()=>{
          UserKit.track('submit', {status: "failure", timestamp: new Date().getTime(), activity_id: todayActivity._id});
          this._handleOpenDialog(err.message);
          userActions.updateChaining(token, 'reset');
        });
      });
    } else {
      actions.submitAnswer(token, currentUser._id, todayActivity.activityId, repoUrl).then(function(res){
        if(res.failures.length > 0){
          throw new Error('Test fail');
        } else {
          storyActions.setCompleteStory(token, todayActivity.storyId).then((status)=>{
            if(status === 200){
              self.setState({openMoveToKnowledgeDialog : true, isSubmitting: false}, ()=>{
                UserKit.track('submit', {status: "success", timestamp: new Date().getTime(), activity_id: todayActivity._id});
                self.confirm.dismiss();
              });
            } else {
              self.setState({isSubmitting: false}, () => {
                UserKit.track('submit', {status: "failure", timestamp: new Date().getTime(), activity_id: todayActivity._id});
                self._handleOpenDialog('Test fails! Please try again.');
                userActions.updateChaining(token, 'reset');
              });
            }
          });
        }
      }).catch((err)=>{
        this.setState({isSubmitting: false}, ()=>{
          UserKit.track('submit', {status: "failure", timestamp: new Date().getTime(), activity_id: todayActivity._id});
          this._handleOpenDialog(err.message);
          userActions.updateChaining(token, 'reset');
        });
      });
    }
  }

  _handleOpenDialog = (message) => {
    this._getStory();
    this.setState({openDialog: true, dialogMessage: message});
  }

  _handleCloseDialog = () => {
    this._getTodayActivity();
    this.setState({openDialog: false, dialogMessage: null});
  }

  _recursive = (parent, visitFn, childrenFn) => {
    if (!parent) return;

    visitFn(parent);

    let children = childrenFn(parent);
    if (children) {
      let count = children.length;
      let numbCompleted = 0;
      for (let i = 0; i < count; i++) {
          this._recursive(children[i], visitFn, childrenFn);
          if(children[i].isComplete){
            numbCompleted++;
          }
      }
      if( count === numbCompleted ){
        parent.isComplete = true;
      } else {
        parent.isComplete = false;
      }
    }
  }

  _treeData = () => {
    const { activity, story, user } = this.props;
    const currentUser = user.get('currentUser');
     if(currentUser && currentUser.enrollments && currentUser.enrollments.length > 0) {
      const completedActivityArr = story.get('stories') ? story.get('stories').map(function(story){
        return story.activity._id;
      }) : [];

      const todayActivity = activity.get('todayActivity');
      const userData = currentUser.enrollments[0] ? currentUser.enrollments[0] : { _id : 0, name : '', nodeType : 'course', isCollapse : false, isComplete : false, isLocked : false, children : null};

      let treeData = {
        "_id" : userData.learningPath._id,
        "name": userData.learningPath.name,
        "nodeType" : "course",
        "isCollapse" : false,
        "isComplete" : false,
        "isLocked" : false,
        "isCurrentNode" : false,
        "children" : JSON.parse(userData.learningPath.nodeTree),
      };

      this._recursive(treeData, function(d) {
        d.isComplete = (completedActivityArr.indexOf(d._id) > -1) ? true : false;
        if(todayActivity && d._id === todayActivity._id) {
          d.isCurrentNode = true;
        }
        if(d.dependency && d.dependency.length > 0
          && completedActivityArr.filter(function (elem) { return d.dependency.indexOf(elem) > -1; }).length != d.dependency.length){
          d.isLocked = true;
        }

        // Detect which nodes is locked
        let children = d.children;
        if (children && d.nodeType === "course") {
            let count = children.length;
            let numbLockedNodes = 0;
            let numbNodeHaveDependency = 0;
            for (let i = 0; i < count; i++) {
                if(children[i].isLocked) {
                  numbLockedNodes++;
                }
                if(children[i].dependency && children[i].dependency.length > 0
                  && completedActivityArr.filter(function (elem) { return children[i].dependency.indexOf(elem) > -1; }).length != children[i].dependency.length){
                  numbNodeHaveDependency++;
                }
            }
            if(count === numbLockedNodes) {
              d.isLocked = true;
            }
            if(count === numbNodeHaveDependency) {
              d.isCollapse = true;
            }
        }
      }, (d) => d.children && d.children.length > 0 ? d.children : null);

      return treeData;
    }
  }

  _handleClickOnMap = (d, canClickOnNode) => {
    if(canClickOnNode) {
      let flag = true;
      const { auth, actions, activity } = this.props;
      // const todayActivity = activity.get('todayActivity');
      // if(todayActivity) {
      //   const { startTime: isStarted } = todayActivity;
      //   if(isStarted) {
      //     alert('You must drop out current activity to select another one');
      //     flag = false;
      //   }
      // }

      if(!d.isComplete && d.nodeType === 'activity') {
        if(d.dependency && d.dependency.length > 0 && d.isLocked){
          alert('Does not meet the requirements! You must finish another nodes to active this one!');
          flag = false;
          return;
        }

        if(flag){
          UserKit.track('start_excercise', {timestamp: new Date().getTime(), activity_id: d._id});
          const token = auth.get('token');
          actions.createActivity(token, d._id);
          this.setState({ openShowMapDialog: false, openSelectAnotherNode : false });
        }
      } else {
        alert('You have finished this activity!');
      }
    } else {
      alert('This map does not allow you to click on node');
    }
  }

  _handleShowMapTap = () => {
    if(this.state.openShowMapDialog === false) {
      this.setState({ openShowMapDialog: true });
    }
  }

  _handleCloseShowMapDialog = () => {
    this.setState({ openShowMapDialog: false });
  }

  _handleCloseGiveUpDialog = () => {
    this.setState({ openGiveUpDialog: false });
  }

  _handleGiveUpTap = () => {
    this.setState({ openGiveUpDialog: true });
  }

  _handleFireGiveUpDialog = () => {
    this.confirm.dismiss();
    this.setState({
      openGiveUpDialog: false,
      openSelectAnotherNode: true,
      countdown: 1500
    }, function(){
      const {auth, actions, activity} = this.props;
      const token = auth.get('token');
      const todayActivity = activity.get('todayActivity');
      actions.giveUpActivity(token, todayActivity._id);
    });
  }

  _handleMoveToKnowledge = () => {
    const {auth, activity, actions} = this.props;
    const token = auth.get('token');
    const todayActivity = activity.get('todayActivity');
    actions.showKnowledge(token, todayActivity._id);
    this.setState({openMoveToKnowledgeDialog: false});
  }

  _handleSkipAndFinish = () => {
    this._handleSetWorkingTimeBeforeLeaving();
    const {auth, activity, storyActions, actions, user, userActions, settings} = this.props;
    const token = auth.get('token');
    const todayActivity = activity.get('todayActivity');
    const currentUser = user.get('currentUser');
    storyActions.completeStory(token, todayActivity._id).then(()=>{
      const sett = settings.get('settings');
      let chainingLevel = (currentUser.chaining + 1);
      chainingLevel = (chainingLevel > sett.maxChainingLevel) ? sett.maxChainingLevel : chainingLevel;
      let points = sett.chainingPoints * chainingLevel;
      this.setState({openMoveToKnowledgeDialog: false, startWorkingTime: 0}, () => {
        let period = 0;
        if(todayActivity.workingTime) {
          period = todayActivity.workingTime;
        }
        UserKit.track('learning_time', {activity_id: todayActivity._id, activity_name: todayActivity.name, student_id: currentUser._id, student_name: currentUser.name,timestamp: new Date().getTime(), period: period});
        actions.deleteTodayActivity();
        userActions.addPoints(token, points).then(()=>{
          userActions.updateChaining(token, 'increase');
        });
      });
    });
  }

  _handleClickSkip = () => {
    this._handleSetWorkingTimeBeforeLeaving();
    const {auth, activity, storyActions, actions, user, settings, userActions} = this.props;
    const token = auth.get('token');
    const todayActivity = activity.get('todayActivity');
    const currentUser = user.get('currentUser');
    storyActions.completeStory(token, todayActivity._id).then(()=>{
      const sett = settings.get('settings');
      let chainingLevel = (currentUser.chaining + 1);
      chainingLevel = (chainingLevel > sett.maxChainingLevel) ? sett.maxChainingLevel : chainingLevel;
      let points = sett.chainingPoints * chainingLevel;
      this.setState({startWorkingTime: 0}, () => {
        let period = 0;
        if(todayActivity.workingTime) {
          period = todayActivity.workingTime;
        }
        UserKit.track('learning_time', {activity_id: todayActivity._id, activity_name: todayActivity.name, student_id: currentUser._id, student_name: currentUser.name, timestamp: new Date().getTime(), period: period});
        actions.deleteTodayActivity();
        userActions.addPoints(token, points).then(()=>{
          userActions.updateChaining(token, 'increase');
        });
      });
    });
  }

  _handleNewComment = (comment) => {
    console.log(comment.text);
  }

  render = () => {
    const {activity, user, pairing, quiz } = this.props;
    const { isSubmitting } = this.state;
    const todayActivity = activity.get('todayActivity');
    const currentUser = user.get('currentUser');
    const partner = pairing.get('pairing');
    let buddy, company, course, name, description, problem, knowledge, isStarted, isCompleted, tester, showKnowledge, solvedProblem;

    if (!currentUser) return null;

    if(todayActivity) {
      company = todayActivity.company;
      course = todayActivity.parent;
      name = todayActivity.name;
      description = todayActivity.description;
      problem = todayActivity.problem;
      knowledge = todayActivity.knowledge;
      isStarted = todayActivity.startTime;
      isCompleted = todayActivity.isCompleted;
      tester = todayActivity.tester;
      showKnowledge = todayActivity.showKnowledge;
      solvedProblem = todayActivity.solvedProblem;
      buddy = (partner) ? ((currentUser._id === partner.studentA._id) ? partner.studentB : partner.studentA) : null;
    }

    return (
      <div className='screen'>
        <ImageComponent className='wallpaper' src='https://d13yacurqjgara.cloudfront.net/users/64177/screenshots/2635137/simonas-maciulis_space2.png' />
        <div style={{position: 'relative', overflow:'auto'}}>
          {
            todayActivity &&
            <div className='activity-card-container' style={(!company && !partner ) ? {maxWidth: 800} : {maxWidth: 1200}}>
              <Card className='activity-content' style={{marginRight: 10}}>
                <CardMedia>
                  <ImageComponent
                    style={{
                      width: 592,
                      height: 120,
                    }}
                    src={course ? course.cover && course.cover.url : ''} />
                </CardMedia>
                <CardTitle
                  className='course_name'
                  title={name}
                  subtitle={course ? course.name : ''} />
                <CardText>
                  {description}
                </CardText>
                {
                  (showKnowledge)?
                  <div>
                    <Divider />
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
                    <Divider />
                    {
                      (!solvedProblem) ?
                      <div>
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
                          {
                            (todayActivity.buddyCompleted === false && partner) ?
                            <div>
                              <Divider /><br/><i>You're finished it and you need to help your buddy overcome this challenge to continue!</i>
                            </div> :
                            <AnswerForm
                            status={isSubmitting ? 'pending' : 'idle'}
                            onSubmit={this._handleSubmit} />
                          }
                        </CardText>
                      </div> :
                      <CardActions>
                        <FlatButton
                        label='Finish this activity'
                        primary={true}
                        onClick={this._handleClickSkip} />
                      </CardActions>
                    }
                  </div>:
                  <div>
                    <Divider />
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
                    {
                      (todayActivity.buddyCompleted && todayActivity.buddyCompleted === false && partner) ?
                      <div>
                        <Divider /><br/><i>You're finished it and you need to help your buddy overcome this challenge to continue!</i>
                      </div> :
                      (
                        (tester) ?
                        (
                          (this.state.displayMoveToKnowledgeButton) ?
                          <div>
                            <CardText dangerouslySetInnerHTML={{__html: problem}} />
                            <Divider />
                            <CardActions>
                              <FlatButton
                                label='Learn about the fundamentals now'
                                primary={true}
                                onClick={this._handleClickLearnThis} />
                            </CardActions>
                          </div> :
                          <CardText>
                            <div dangerouslySetInnerHTML={{__html: problem}} />
                            <AnswerForm
                              status={isSubmitting ? 'pending' : 'idle'}
                              onSubmit={this._handleSubmit} />
                          </CardText>
                        ) :
                        <div>
                          <CardText dangerouslySetInnerHTML={{__html: knowledge}} />
                          <Divider />
                          <CardActions>
                            <FlatButton
                            label='Finish this activity'
                            primary={true}
                            onClick={this._handleClickSkip} />
                          </CardActions>
                        </div>
                      )
                    }
                    <iframe src={"http://hasbrain.com/forum/"+todayActivity._id} width="100%" height="800" style={{border:'none'}}></iframe>
                  </div>
                }
              </Card>
              <div className='company'>
                { (company) && <Card>
                      <CardTitle
                        style={{
                          width: 592,
                        }}
                        title={company ? company.name : ''}
                        subtitle={company ? company.email : ''} />
                      <CardText>
                        <div dangerouslySetInnerHTML={{__html: company.description}} />
                        <br/>
                        <Divider />
                        <br/>
                        {company ? 'Contact: ' + company.contact : ''}
                      </CardText>
                    </Card> }

                { (buddy) && <Card>
                      <CardHeader
                        title="Your buddy"
                        subtitle="Will help you come over this challenge"
                      />
                      <CardText>
                        <List>
                          <ListItem
                            primaryText={`${buddy.name.first} ${buddy.name.last}`}
                            leftAvatar={
                              <Avatar src="https://avatars3.githubusercontent.com/u/12455778?v=3&s=460" />
                            }
                            />
                        </List>
                      </CardText>
                    </Card> }
              </div>
            </div>
          }
        </div>
        {
          (todayActivity) ?
          <div>
            <FloatingActionButton secondary={true} onTouchTap={this._handleShowMapTap} className='showMap'><FontIcon className='material-icons'>map</FontIcon></FloatingActionButton>
            {(!isCompleted && !solvedProblem) && <FloatingActionButton onTouchTap={this._handleGiveUpTap} className='giveUp'><FontIcon className='material-icons'>exit_to_app</FontIcon></FloatingActionButton>}

            <Dialog
              title='Notice'
              actions={[
                <FlatButton
                  label='GOT IT'
                  primary={true}
                  keyboardFocused={true}
                  onTouchTap={this._handleCloseDialog} />,
              ]}
              modal={true}
              open={this.state.openDialog}>
              {this.state.dialogMessage}
            </Dialog>

            <Dialog
              title='Confirm'
              actions={[
                <FlatButton
                  label='Cancel'
                  secondary={true}
                  onTouchTap={this._handleCloseGiveUpDialog} />,
                <FlatButton
                  label='Yes'
                  primary={true}
                  keyboardFocused={true}
                  onTouchTap={this._handleFireGiveUpDialog} />,
              ]}
              modal={false}
              open={this.state.openGiveUpDialog}>Do you want to give up?</Dialog>

            <Dialog
              actions={[
                <FlatButton
                label='Close'
                secondary={true}
                onTouchTap={this._handleCloseShowMapDialog} />
              ]}
              title='Your learning path'
              modal={true}
              open={this.state.openShowMapDialog}
              onRequestClose={this._handleClose}
              titleStyle={{textAlign:'center'}}
              bodyStyle={{padding: 0}}
              contentStyle={{width: '100%', maxWidth: 'none', height: '100%', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}
              actionsContainerStyle={{position: 'absolute', bottom: 0, left: 0, backgroundColor: '#fff', marginBottom: 0, zIndex: 99999}}
              autoDetectWindowHeight={false}
            >
              <D3Tree
                treeData={this._treeData()}
                onClick={this._handleClickOnMap}
                canClickOnNode={false} />
            </Dialog>

            <Dialog
              modal={true}
              open={this.state.openSelectAnotherNode}
              contentStyle={{width: '100%', maxWidth: 'none', height: '100%', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}
              bodyStyle={{padding: 0}}
              autoDetectWindowHeight={false}
              >
                <D3Tree
                treeData={this._treeData()}
                onClick={this._handleClickOnMap}
                canClickOnNode={true} />
            </Dialog>

            <Dialog
              title='Notice'
              actions={[
                <FlatButton
                  label='Skip and finish'
                  secondary={true}
                  onTouchTap={this._handleSkipAndFinish} />,
                <FlatButton
                  label='Yes'
                  primary={true}
                  keyboardFocused={true}
                  onTouchTap={this._handleMoveToKnowledge} />,
              ]}
              modal={false}
              open={this.state.openMoveToKnowledgeDialog}>You finished this activity. Do you want to move on knowledge part?</Dialog>
          </div>:
          <Dialog
            modal={true}
            contentStyle={{width: '100%', maxWidth: 'none', height: '100%', maxHeight: 'none', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}
            bodyStyle={{padding: 0}}
            autoDetectWindowHeight={false}
            open={this.state.showLearningTree}
            >
            <D3Tree
              treeData={this._treeData()}
              onClick={this._handleClickOnMap}
              canClickOnNode={true} />
          </Dialog>
        }
        <CountdownConfirm
          ref={(node) => {
            this.confirm = node;
          }} />
      </div>
    );
  }
};

function mapStateToProps(state) {
  return {
    activity: state.activity,
    auth: state.auth,
    user: state.user,
    story: state.story,
    learningPath : state.learningPath,
    pairing : state.pairing,
    quiz: state.quiz,
    settings: state.settings,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(ActivityActions, dispatch),
    userActions: bindActionCreators(UserActions, dispatch),
    storyActions: bindActionCreators(StoryActions, dispatch),
    pathActions: bindActionCreators(PathActions, dispatch),
    pairingActions: bindActionCreators(PairingActions, dispatch),
    quizActions: bindActionCreators(QuizActions, dispatch),
    settingsActions: bindActionCreators(SettingsActions, dispatch)
  };
}

export default Home;
