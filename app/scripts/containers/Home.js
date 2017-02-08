import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import Dialog from 'material-ui/lib/dialog';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import FontIcon from 'material-ui/lib/font-icon';

import ImageComponent from 'components/Image';
import * as ActivityActions from 'actions/activity';
import * as UserActions from 'actions/user';
import * as StoryActions from 'actions/story';
import * as PathActions from 'actions/learningPath';
import * as PairingActions from 'actions/pairing';
import * as SettingsActions from 'actions/settings';

import Activity from './Activity/index';
import ActivityTree from './Activity/ActivityTree';

@connect(mapStateToProps, mapDispatchToProps)
class Home extends Component {
    state = {
        showLearningTree: false,
        openShowMapDialog: false,
        openSelectAnotherNode: false
    }

    componentDidMount = () => {
        this._getUser();
        this._getTodayActivity();
        this._getStory();
        this._getPath();
        this._getPartner();
    }

    componentWillReceiveProps = (nextProps) => {
        const {activity} = this.props;
        const thisActivity = activity.get('todayActivity');
        const nextActivity = nextProps.activity.get('todayActivity');
        const thisCheck = activity.get('finishGettingTodayActivity');
        const nextCheck = nextProps.activity.get('finishGettingTodayActivity');
        if (thisCheck !== nextCheck && nextCheck) {
            if (!nextActivity || !thisActivity) {
                if (typeof this.state.showLearningTree !== undefined) {
                    // Display learning tree if don't have current node
                    this.setState({showLearningTree: true});
                }
            }
        }
    }

    _handleClickOnMap = (d, canClickOnNode) => {
        if (canClickOnNode) {
            let flag = true;
            const {auth, actions, activity} = this.props;

            if (!d.isComplete && d.nodeType === 'activity') {
                if (d.dependency && d.dependency.length > 0 && d.isLocked) {
                    alert('Does not meet the requirements! You must finish another nodes to active this one!');
                    flag = false;
                    return;
                }

                if (flag) {
                    UserKit.track('start_excercise', {
                        timestamp: new Date().getTime(),
                        activity_id: d._id
                    });
                    const token = auth.get('token');
                    actions.createActivity(token, d._id);
                    this.setState({openShowMapDialog: false, openSelectAnotherNode: false});
                }
            } else {
                alert('You have finished this activity!');
            }
        } else {
            alert('This map does not allow you to click on node');
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
        const {auth, pairingActions} = this.props;
        const token = auth.get('token');
        pairingActions.getPartner(token);
    }

    render = () => {
        const {activity, user} = this.props;
        const todayActivity = activity.get('todayActivity');
        const currentUser = user.get('currentUser');

        if (!currentUser)
            return null;

        return (
            <div className='screen'>
                <ImageComponent className='wallpaper' src='https://d13yacurqjgara.cloudfront.net/users/64177/screenshots/2635137/simonas-maciulis_space2.png'/>
                {
                    todayActivity
                    ? <Activity/>
                    : <Dialog
                        modal={true}
                        contentStyle={{
                            width: '100%',
                            maxWidth: 'none',
                            height: '100%',
                            maxHeight: 'none',
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
                        }}
                        bodyStyle={{padding: 0}}
                        autoDetectWindowHeight={false}
                        open={this.state.showLearningTree}>
                        <ActivityTree
                            onClick={this._handleClickOnMap}
                            canClickOnNode={true}/>
                    </Dialog>
                }
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
        learningPath: state.learningPath,
        pairing: state.pairing,
        settings: state.settings
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(ActivityActions, dispatch),
        userActions: bindActionCreators(UserActions, dispatch),
        storyActions: bindActionCreators(StoryActions, dispatch),
        pathActions: bindActionCreators(PathActions, dispatch),
        pairingActions: bindActionCreators(PairingActions, dispatch),
        settingsActions: bindActionCreators(SettingsActions, dispatch)
    };
}

export default Home;
