import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import Colors from 'material-ui/lib/styles/colors';
import FontIcon from 'material-ui/lib/font-icon';
import CardHeader from 'material-ui/lib/card/card-header';
import CardText from 'material-ui/lib/card/card-text';
import CardActions from 'material-ui/lib/card/card-actions';
import Divider from 'material-ui/lib/divider';
import Avatar from 'material-ui/lib/avatar';
import FlatButton from 'material-ui/lib/flat-button';

import * as ActivityActions from 'actions/activity';

@connect(mapStateToProps, mapDispatchToProps)
class ActivityKnowledgeSection extends Component {
    _handleClickSolveTheProblem = () => {
        const {auth, activity, actions} = this.props;
        const token = auth.get('token');
        const todayActivity = activity.get('todayActivity');
        actions.update(token, todayActivity.storyId, {
            "showKnowledge" : false,
            "solvedProblem" : false,
            "isCompleted" : false
        });
    }

    render = () => {
        const {activity, pairing, handleClickSkip} = this.props;
        const todayActivity = activity.get('todayActivity');
        const partner = pairing.get('pairing');
        const {knowledge, solvedProblem, buddyCompleted} = todayActivity;
        return (
            <div>
                <Divider/>
                <CardHeader title='Knowledge'
                    subtitle='What you need to finish this activity'
                    avatar={
                        <Avatar icon={
                            <FontIcon className = 'material-icons'>
                                extension
                            </FontIcon>}
                        color={Colors.lightBlue500}
                        backgroundColor={Colors.grey100} />
                    }/>
                <CardText dangerouslySetInnerHTML={{__html: knowledge}}/>
                <Divider/>
                {
                    (buddyCompleted && buddyCompleted === false && partner)
                    ? <div>
                            <Divider/><br/>
                            <i>You are finished it and you need to help your buddy overcome this challenge to continue!</i>
                      </div>
                    : (
                        solvedProblem
                        ? <CardActions>
                                <FlatButton label='Finish this activity' primary={true} onClick={handleClickSkip}/>
                            </CardActions>
                        : <CardActions>
                            <FlatButton label='Solve the problem' primary={true} onClick={this._handleClickSolveTheProblem}/>
                        </CardActions>
                    )
                }
            </div>
        )
    }
};

function mapStateToProps(state) {
    return {
        activity: state.activity,
        pairing: state.pairing,
        auth: state.auth
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(ActivityActions, dispatch)
    };
}

export default ActivityKnowledgeSection;
