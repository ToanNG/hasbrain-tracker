import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import Shepherd from 'tether-shepherd';
import ReactDisqusThread from 'react-disqus-thread';

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
import Quiz from 'components/Quiz';
import * as ActivityActions from 'actions/activity';
import * as UserActions from 'actions/user';
import * as StoryActions from 'actions/story';
import * as PathActions from 'actions/learningPath';
import * as PairingActions from 'actions/pairing';
import * as QuizActions from 'actions/quiz';
import * as SettingsActions from 'actions/settings';

import ActivityTree from './ActivityTree';
import ActivityKnowledgeSection from './ActivityKnowledgeSection';
import ActivityChallengeSection from './ActivityChallengeSection';
import ActivityCompanyInfoSection from './ActivityCompanyInfoSection';

let pubnub = PUBNUB({
    publish_key: 'pub-c-8807fd6d-6f87-486f-9fd6-5869bc37e93a',
    subscribe_key: 'sub-c-861f96a2-3c20-11e6-9236-02ee2ddab7fe',
});

@connect(
  mapStateToProps,
  mapDispatchToProps
)
class Activity extends Component {
    state = {
        openDialog: false,
        openShowMapDialog: false,
        openGiveUpDialog: false,
        openSelectAnotherNode: false,
        dialogMessage: null,
        openMoveToKnowledgeDialog : false,
        countdown: 1500,
        startWorkingTime: 0
    }

    componentDidMount = () => {
        this.setState({startWorkingTime: new Date().getTime()});
        window.addEventListener('message', this._handleReceiveMessage);
        window.addEventListener('beforeunload', this._handleSetWorkingTimeBeforeLeaving);
    }

    componentWillUnmount = () => {
        window.removeEventListener('message', this._handleReceiveMessage);
        window.removeEventListener('beforeunload', this._handleSetWorkingTimeBeforeLeaving);
    }

    componentDidUpdate = () => {
        Prism.highlightAll();
    }

    componentWillReceiveProps = (nextProps) => {
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
    }

    _handleClickOnMapSuccess = () => {
        this.setState({openShowMapDialog: false, openSelectAnotherNode: false});
    }

    _getStory = () => {
        const {auth, storyActions} = this.props;
        const token = auth.get('token');
        storyActions.getCompleteStory(token);
    }

    _getTodayActivity = () => {
        const {auth, actions} = this.props;
        const token = auth.get('token');
        actions.getTodayActivity(token);
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

    _handleLogoutTap = _ => {
        console.log('Bye bye ~~~');
        chrome.storage.local.clear();
        location.reload();
    }

    _handleOpenDialog = (message) => {
        this._getStory();
        this.setState({openDialog: true, dialogMessage: message});
    }

    _handleCloseDialog = () => {
        this._getTodayActivity();
        this.setState({openDialog: false, dialogMessage: null});
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

    _handleClickSkip = () => {
        this._handleSetWorkingTimeBeforeLeaving();
        const {
            auth,
            activity,
            storyActions,
            actions,
            user,
            userActions,
            settings
        } = this.props;
        const token = auth.get('token');
        const todayActivity = activity.get('todayActivity');
        const currentUser = user.get('currentUser');
        storyActions.completeStory(token, todayActivity._id).then(() => {
            const sett = settings.get('settings');
            let chainingLevel = (currentUser.chaining + 1);
            chainingLevel = (chainingLevel > sett.maxChainingLevel)
                ? sett.maxChainingLevel
                : chainingLevel;
            let points = sett.chainingPoints * chainingLevel;
            this.setState({
                openMoveToKnowledgeDialog: false,
                startWorkingTime: 0
            }, () => {
                let period = 0;
                if (todayActivity.workingTime) {
                    period = todayActivity.workingTime;
                }
                UserKit.track('learning_time', {
                    activity_id: todayActivity._id,
                    activity_name: todayActivity.name,
                    student_id: currentUser._id,
                    student_name: currentUser.name,
                    timestamp: new Date().getTime(),
                    period: period
                });
                userActions.addPoints(token, points).then(() => {
                    userActions.updateChaining(token, 'increase');
                });
                this._getTodayActivity();
            });
        });
    }

    _handleSubmitChallengeSuccess = () => {
        const todayActivity = this.props.activity.get('todayActivity');
        this.setState({openMoveToKnowledgeDialog : true}, ()=>{
            UserKit.track('submit', {status: "success", timestamp: new Date().getTime(), activity_id: todayActivity._id});
            this.confirm.dismiss();
        });
    }

    _renderButtons() {
        const {activity} = this.props;
        const todayActivity = activity.get('todayActivity');
        const {isCompleted, solvedProblem} = todayActivity;
        return (
            <div>
                <FloatingActionButton
                    secondary={true}
                    onTouchTap={this._handleShowMapTap}
                    className='showMap'>
                    <FontIcon className='material-icons'>map</FontIcon>
                </FloatingActionButton>
                {
                    (!isCompleted && !solvedProblem) &&
                    <FloatingActionButton
                        onTouchTap={this._handleGiveUpTap}
                        className='giveUp'>
                        <FontIcon className='material-icons'>clear</FontIcon>
                    </FloatingActionButton>
                }
                <FloatingActionButton
                    secondary={true}
                    onTouchTap={this._handleLogoutTap}
                    className='logout'>
                    <FontIcon className='material-icons'>exit_to_app</FontIcon>
                </FloatingActionButton>
            </div>
        )
    }

    _renderDialogs () {
        const {openDialog, openGiveUpDialog, openShowMapDialog, openSelectAnotherNode, openMoveToKnowledgeDialog, dialogMessage} = this.state;
        return (
            <div>
                <Dialog title='Notice' actions={[
                        <FlatButton label = 'GOT IT'
                             primary = {true}
                             keyboardFocused = {true}
                             onTouchTap = {this._handleCloseDialog}
                         />
                     ]}
                     modal={true}
                     open={openDialog}>
                    {dialogMessage}
                </Dialog>

                <Dialog title='Confirm' actions={[
                        <FlatButton label = 'Cancel'
                            secondary = {true}
                            onTouchTap = {this._handleCloseGiveUpDialog}
                        />,
                        <FlatButton label = 'Yes'
                            primary = {true}
                            keyboardFocused = {true}
                            onTouchTap = {this._handleFireGiveUpDialog}
                        />
                    ]}
                    modal={false}
                    open={openGiveUpDialog}>
                    Do you want to give up?
                </Dialog>

                <Dialog actions={[
                        <FlatButton label = 'Close'
                            secondary = {true}
                            onTouchTap = {this._handleCloseShowMapDialog}
                        />
                    ]}
                    title='Your learning path'
                    modal={true}
                    open={openShowMapDialog}
                    onRequestClose={this._handleClose}
                    titleStyle={{textAlign: 'center'}}
                    bodyStyle={{padding: 0}}
                    contentStyle={{
                        width: '100%',
                        maxWidth: 'none',
                        height: '100%',
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                    actionsContainerStyle={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        backgroundColor: '#fff',
                        marginBottom: 0,
                        zIndex: 99999
                    }}
                    autoDetectWindowHeight={false}>
                        <ActivityTree
                            canClickOnNode={false}
                            clickOnMapSuccess={this._handleClickOnMapSuccess} />
                </Dialog>

                <Dialog modal={true}
                    open={openSelectAnotherNode}
                    contentStyle={{
                        width: '100%',
                        maxWidth: 'none',
                        height: '100%',
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                    bodyStyle={{padding: 0}}
                    autoDetectWindowHeight={false}>
                    <ActivityTree
                        canClickOnNode={true}
                        clickOnMapSuccess={this._handleClickOnMapSuccess} />
                </Dialog>

                <Dialog title='Notice' actions={[
                        <FlatButton label = 'Skip and finish'
                            secondary = {true}
                            onTouchTap = {this._handleClickSkip}
                        />,
                        <FlatButton label = 'Yes'
                            primary = {true}
                            keyboardFocused = {true}
                            onTouchTap = {this._handleMoveToKnowledge}
                        />
                    ]}
                    modal={false}
                    open={openMoveToKnowledgeDialog}>
                    You finished this activity. Do you want to move on knowledge part?
                </Dialog>
            </div>
        )
    }

    render() {
        const {activity, pairing} = this.props;
        const todayActivity = activity.get('todayActivity');
        const partner = pairing.get('pairing');

        const {company, course, name, description, showKnowledge} = todayActivity

        return (
            <div>
                <div style={{position: 'relative', overflow: 'auto'}}>
                    <div className='activity-card-container'
                        style={{maxWidth: (!company && !partner) ? 800 : 1200}}>
                        <Card className='activity-content' style={{marginRight: 10}}>
                            <CardMedia>
                                <ImageComponent style={{width: 592, height: 120}}
                                    src={course ? course.cover && course.cover.url : ''}/>
                            </CardMedia>
                            <CardTitle className='course_name'
                                title={name}
                                subtitle={course ? course.name: ''}/>
                            <CardText>
                                {description}
                            </CardText>
                            {
                                showKnowledge
                                ? <ActivityKnowledgeSection
                                    handleClickSkip={this._handleClickSkip} />
                                : <ActivityChallengeSection
                                    handleSubmitChallengeSuccess={this._handleSubmitChallengeSuccess}
                                    handleOpenDialog={this._handleOpenDialog}
                                    handleClickSkip={this._handleClickSkip} />
                            }
                        </Card>
                        <ActivityCompanyInfoSection />
                    </div>
                </div>
                <div>
                    {this._renderButtons()}
                    {this._renderDialogs()}
                </div>
                <CountdownConfirm
                  ref={(node) => {
                    this.confirm = node;
                  }} />
            </div>
        )
    }
}

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

export default Activity;
