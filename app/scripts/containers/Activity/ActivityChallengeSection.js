import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {parseString} from 'xml2js';

import Colors from 'material-ui/lib/styles/colors';
import FontIcon from 'material-ui/lib/font-icon';
import CardHeader from 'material-ui/lib/card/card-header';
import CardText from 'material-ui/lib/card/card-text';
import CardActions from 'material-ui/lib/card/card-actions';
import Divider from 'material-ui/lib/divider';
import Avatar from 'material-ui/lib/avatar';
import FlatButton from 'material-ui/lib/flat-button';
import AnswerForm from 'components/AnswerForm';

import * as ActivityActions from 'actions/activity';
import * as UserActions from 'actions/user';
import * as StoryActions from 'actions/story';

@connect(mapStateToProps, mapDispatchToProps)
class ActivityChallengeSection extends Component {
    state = {
        isSubmitting: false
    }

    _handleSubmitChallengeSuccess = () => {
        const {handleSubmitChallengeSuccess} = this.props;
        this.setState({isSubmitting: false});
        handleSubmitChallengeSuccess();
    }

    _handleSubmitChallengeFailed = (msg) => {
        const {auth, activity, userActions, handleOpenDialog} = this.props;
        const token = auth.get('token');
        const todayActivity = activity.get('todayActivity');
        this.setState({isSubmitting: false}, () => {
            UserKit.track('submit', {status: "failure", timestamp: new Date().getTime(), activity_id: todayActivity._id});
            handleOpenDialog(msg);
            userActions.updateChaining(token, 'reset');
        });
    }

    _handleSubmit = (repoUrl) => {
        let self = this;
        const {
            auth,
            activity,
            user,
            actions,
            storyActions
        } = this.props;
        const token = auth.get('token');
        const todayActivity = activity.get('todayActivity');
        const currentUser = user.get('currentUser');
        self.setState({isSubmitting: true});

        // Determine that which learning path are learning for choosing the right test server
        switch (todayActivity.learningPath._id) {
            case '58130aa6c0c71fa70567ec09': // C++
                actions.submitAnswerCpp(token, currentUser._id, todayActivity.activityId, repoUrl)
                    .then(function(res) {
                        parseString(res, function(err, result) {
                            if (result.Catch.OverallResults[0].$.successes == 0 && result.Catch.OverallResults[0].$.failures == 1) {
                                throw new Error('Test fail');
                            } else if (result.Catch.OverallResults[0].$.successes == 5 && result.Catch.OverallResults[0].$.failures == 0) {
                                storyActions.setCompleteStory(token, todayActivity.storyId).then((status) => {
                                    if (status === 200) {
                                        self._handleSubmitChallengeSuccess()
                                    } else {
                                        self._handleSubmitChallengeFailed('Test fails! Please try again.')
                                    }
                                });
                            } else {
                                throw new Error('Unexpected Error!');
                            }
                        });
                    })
                    .catch((err) => {
                        self._handleSubmitChallengeFailed(err.message)
                    });
                break;
            case '5815923cc0c71fa70567ec1a': // Java
                actions.submitAnswerJava(token, currentUser._id, todayActivity.activityId, repoUrl)
                    .then(function(res) {
                        let lines = res.split('\n');
                        if (lines[4].indexOf('OK') > -1) {
                            storyActions.setCompleteStory(token, todayActivity.storyId).then((status) => {
                                if (status === 200) {
                                    self._handleSubmitChallengeSuccess()
                                } else {
                                    self._handleSubmitChallengeFailed('Test fails! Please try again.')
                                }
                            });
                        } else {
                            let ret = '';
                            for (let i = 3; i < (lines.length - 5); i++) {
                                ret += '\n' + lines[i];
                            }
                            throw new Error(ret);
                        }
                    })
                    .catch((err) => {
                        self._handleSubmitChallengeFailed(err.message)
                    });
                break;
            default:
                actions.submitAnswer(token, currentUser._id, todayActivity.activityId, repoUrl)
                    .then(function(res) {
                        if (res.failures.length > 0) {
                            throw new Error('Test fail');
                        } else {
                            storyActions.setCompleteStory(token, todayActivity.storyId).then((status) => {
                                if (status === 200) {
                                    self._handleSubmitChallengeSuccess()
                                } else {
                                    self._handleSubmitChallengeFailed('Test fails! Please try again.')
                                }
                            });
                        }
                    })
                    .catch((err) => {
                        self._handleSubmitChallengeFailed(err.message)
                    });
                break; // Other test
        }
    }

    render = () => {
        const {activity, user} = this.props;
        const todayActivity = activity.get('todayActivity');
        const currentUser = user.get('currentUser');
        const {company, problem, answerType, tester, storyId, typeformId, knowledge} = todayActivity;
        const {isSubmitting} = this.state;

        return (
            <div>
                <Divider/>
                <CardHeader title='Challenge'
                    subtitle= {
                        company
                        ? <span>Contributed by <a href={`mailto:${company.email}`}>{company.name}</a></span>
                        : 'Try it first with all you got'
                    }
                    avatar={
                        <Avatar icon = {
                            <FontIcon className = 'material-icons'>
                                error
                            </FontIcon>
                        }
                        color={Colors.red500}
                        backgroundColor={Colors.grey100} />
                    }
                />
                {
                    answerType === 'typeFormQuiz'
                    ? <div>
                            <CardText dangerouslySetInnerHTML={{
                                __html: problem
                            }}/>
                            <Divider/>
                            <iframe style={{
                                width: '100%',
                                height: '500px',
                                border: 'none'
                            }} src={"https://hasbrain.typeform.com/to/" + typeformId + "?student_id=" + currentUser._id + "&story_id=" + storyId}></iframe>
                        </div>
                    : tester
                        ?   <CardText>
                                <div dangerouslySetInnerHTML={{
                                    __html: problem
                                }}/>
                                <AnswerForm status={isSubmitting
                                    ? 'pending'
                                    : 'idle'} onSubmit={this._handleSubmit}/>
                            </CardText>
                        :   <div>
                                <CardText dangerouslySetInnerHTML={{
                                    __html: knowledge
                                }}/>
                                <Divider/>
                                <CardActions>
                                    <FlatButton label='Finish this activity' primary={true} onClick={this.props.handleClickSkip}/>
                                </CardActions>
                            </div>
                }
                <iframe src={"http://hasbrain.com/forum/" + todayActivity._id}
                    width="100%"
                    height="800"
                    style={{border: 'none'}}>
                </iframe>
            </div>
        )
    }
};

function mapStateToProps(state) {
    return {
        activity: state.activity,
        user: state.user,
        auth: state.auth
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(ActivityActions, dispatch),
        userActions: bindActionCreators(UserActions, dispatch),
        storyActions: bindActionCreators(StoryActions, dispatch)
    };
}

export default ActivityChallengeSection;
