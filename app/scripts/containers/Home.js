import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import Shepherd from 'tether-shepherd';

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
import * as ActivityActions from 'actions/activity';
import * as UserActions from 'actions/user';
import * as StoryActions from 'actions/story';
import * as PathActions from 'actions/learningPath';
import * as PairingActions from 'actions/pairing';

let pubnub = PUBNUB({
  publish_key: 'pub-c-8807fd6d-6f87-486f-9fd6-5869bc37e93a',
  subscribe_key: 'sub-c-861f96a2-3c20-11e6-9236-02ee2ddab7fe',
});

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
    })
  }

  componentDidMount = () => {
    this._getUser();
    this._getTodayActivity();
    this._getStory();
    this._getPath();
    this._getPartner();
  }

  componentDidUpdate = () => {
    Prism.highlightAll();
  }

  componentWillReceiveProps = (nextProps) => {
    var tempActivity = null, tempUser = null;

    const thisUser = this.props.user.get('currentUser');
    const nextUser = nextProps.user.get('currentUser');
    if (nextUser !== thisUser && nextUser) {
      console.log(`Subscribing to channel hasbrain_test_${nextUser._id} ...`);
      pubnub.subscribe({
        channel: `hasbrain_test_${nextUser._id}`,
        message: (message, env, ch, timer, magic_ch) => {
          if(message.type && message.status && message.type === 'test_result' && message.status === 1){
            this.setState({openMoveToKnowledgeDialog : true});
            this.confirm.dismiss();
          } else {
            this._handleOpenDialog(message.text);
          }
        },
      });

      tempUser = nextUser;
    }

    const thisActivity = this.props.activity.get('todayActivity');
    const nextActivity = nextProps.activity.get('todayActivity');
    if(thisActivity !== nextActivity && nextActivity){
      tempActivity = nextActivity;
    }

    if(!tempUser) { tempUser = thisUser; }
    if(!tempActivity){ tempActivity = thisActivity; }
    if(tempUser && tempActivity) {
      if(tempActivity.tester && !tempActivity.showKnowledge && !this.state.displayMoveToKnowledgeButton){
        this._countDown();
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

    if(nextUser && nextUser.enrollments && nextProps.story.get('stories')){
      this.setState({showLearningTree: true});
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
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
  }

  _handleClickLearnThis = () => {
    const {auth, activity, actions} = this.props;
    const token = auth.get('token');
    const todayActivity = activity.get('todayActivity');
    actions.showKnowledge(token, todayActivity._id);
  }

  _handleClickSkip = () => {
    const {auth, activity, storyActions} = this.props;
    const token = auth.get('token');
    const todayActivity = activity.get('todayActivity');
    storyActions.completeStory(token, todayActivity._id);
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
    const {auth, activity, actions} = this.props;
    const token = auth.get('token');
    const todayActivity = activity.get('todayActivity');
    actions.submitAnswer(token, todayActivity.storyId, repoUrl);
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

    var children = childrenFn(parent);
    if (children) {
      var count = children.length;
      var numbCompleted = 0;
      for (var i = 0; i < count; i++) {
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
    let completedNodes = [];
    const currentUser = user.get('currentUser');
     if(currentUser && currentUser.enrollments && currentUser.enrollments.length > 0) {
      const completedActivityArr = story.get('stories') ? story.get('stories').map(function(story){
        return story.activity._id;
      }) : [];

      const todayActivity = activity.get('todayActivity');
      const userData = currentUser.enrollments[0] ? currentUser.enrollments[0] : { _id : 0, name : '', nodeType : 'course', isCollapse : false, isComplete : false, isLocked : false, children : null};

      var treeData = {
        "_id" : userData.learningPath._id,
        "name": userData.learningPath.name,
        "nodeType" : "course",
        "isCollapse" : false,
        "isComplete" : false,
        "isLocked" : false,
        "isCurrentNode" : false,
        "children" : JSON.parse(userData.learningPath.nodeTree),
      };

      // Detect nodes which is completed
      this._recursive(treeData, function(d) {
        d.isComplete = (completedActivityArr.indexOf(d._id) > -1) ? true : false;
        if(todayActivity && d._id === todayActivity._id) {
          d.isCurrentNode = true;
        }
      }, (d) => d.children && d.children.length > 0 ? d.children : null);

      // Detect nodes which should collapse
      this._recursive(treeData, function(d) {

        if(d.isComplete && completedNodes.indexOf(d._id) === -1){ completedNodes.push(d._id); }

        var children = d.children;
        if (children) {
            var count = children.length;
            var numbNodeHaveDependency = 0;
            for (var i = 0; i < count; i++) {
                if(children[i].dependency && children[i].dependency.length > 0 && completedNodes.filter(function (elem) { return children[i].dependency.indexOf(elem) > -1; }).length != children[i].dependency.length){
                  numbNodeHaveDependency++;
                }
            }
            if(d.nodeType === "course" && count === numbNodeHaveDependency) {
              d.isCollapse = true;
            }
        }
        
        if(d.dependency && d.dependency.length > 0){
          if(completedNodes.filter(function (elem) { return d.dependency.indexOf(elem) > -1; }).length === d.dependency.length){
            d.isLocked = false;
          } else {
            d.isLocked = true;
          }
        } else {
          d.isLocked = false;
        }
      }, (d) => d.children && d.children.length > 0 ? d.children : null);

      // Detect which nodes is locked
      this._recursive(treeData, function(d) {
        var children = d.children;
        if (children) {
            var count = children.length;
            var numbLockedNodes = 0;
            for (var i = 0; i < count; i++) {
                if(children[i].isLocked) {
                  numbLockedNodes++;
                }
            }
            if(d.nodeType === "course" && count === numbLockedNodes) {
              d.isLocked = true;
            }
        }
      }, (d) => d.children && d.children.length > 0 ? d.children : null);

      return treeData;
    }
  }

  _handleClickOnMap = (d, canClickOnNode) => {
    if(canClickOnNode) {
      var flag = true;
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
    const {auth, activity, storyActions} = this.props;
    const token = auth.get('token');
    const todayActivity = activity.get('todayActivity');
    storyActions.completeStory(token, todayActivity._id);
    this.setState({openMoveToKnowledgeDialog: false});
  }

  render = () => {
    const {activity, user, pairing } = this.props;
    const todayActivity = activity.get('todayActivity');
    const isSubmitting = activity.get('isSubmitting');
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
              actionsContainerStyle={{position: 'absolute', bottom: 0, left: 0, backgroundColor: '#fff', marginBottom: 0}}
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
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(ActivityActions, dispatch),
    userActions: bindActionCreators(UserActions, dispatch),
    storyActions: bindActionCreators(StoryActions, dispatch),
    pathActions: bindActionCreators(PathActions, dispatch),
    pairingActions: bindActionCreators(PairingActions, dispatch),
  };
}

export default Home;
