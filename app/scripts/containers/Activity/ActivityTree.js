import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import D3Tree from 'components/D3Tree';

import * as ActivityActions from 'actions/activity';

@connect(mapStateToProps, mapDispatchToProps)
class ActivityTree extends Component {
    _recursive = (parent, visitFn, childrenFn) => {
        if (!parent)
            return;

        visitFn(parent);

        let children = childrenFn(parent);
        if (children) {
            let count = children.length;
            let numbCompleted = 0;
            for (let i = 0; i < count; i++) {
                this._recursive(children[i], visitFn, childrenFn);
                if (children[i].isComplete) {
                    numbCompleted++;
                }
            }
            if (count === numbCompleted) {
                parent.isComplete = true;
            } else {
                parent.isComplete = false;
            }
        }
    }

    _treeData = () => {
        const {activity, story, user} = this.props;
        const currentUser = user.get('currentUser');
        if (currentUser && currentUser.enrollments && currentUser.enrollments.length > 0) {
            const completedActivityArr = story.get('stories')
                ? story.get('stories').map(function(story) {
                    return story.activity._id;
                })
                : [];

            const todayActivity = activity.get('todayActivity');
            const userData = currentUser.enrollments[0]
                ? currentUser.enrollments[0]
                : {
                    _id: 0,
                    name: '',
                    nodeType: 'course',
                    isCollapse: false,
                    isComplete: false,
                    isLocked: false,
                    children: null
                };

            let treeData = {
                "_id": userData.learningPath._id,
                "name": userData.learningPath.name,
                "nodeType": "course",
                "isCollapse": false,
                "isComplete": false,
                "isLocked": false,
                "isCurrentNode": false,
                "children": JSON.parse(userData.learningPath.nodeTree)
            };

            this._recursive(treeData, function(d) {
                d.isComplete = (completedActivityArr.indexOf(d._id) > -1)
                    ? true
                    : false;
                if (todayActivity && d._id === todayActivity._id) {
                    d.isCurrentNode = true;
                }
                if (d.dependency && d.dependency.length > 0 && completedActivityArr.filter(function(elem) {
                    return d.dependency.indexOf(elem) > -1;
                }).length != d.dependency.length) {
                    d.isLocked = true;
                }

                // Detect which nodes is locked
                let children = d.children;
                if (children && d.nodeType === "course") {
                    let count = children.length;
                    let numbLockedNodes = 0;
                    let numbNodeHaveDependency = 0;
                    for (let i = 0; i < count; i++) {
                        if (children[i].isLocked) {
                            numbLockedNodes++;
                        }
                        if (children[i].dependency && children[i].dependency.length > 0 && completedActivityArr.filter(function(elem) {
                            return children[i].dependency.indexOf(elem) > -1;
                        }).length != children[i].dependency.length) {
                            numbNodeHaveDependency++;
                        }
                    }
                    if (count === numbLockedNodes) {
                        d.isLocked = true;
                    }
                    if (count === numbNodeHaveDependency) {
                        d.isCollapse = true;
                    }
                }
            }, (d) => d.children && d.children.length > 0
                ? d.children
                : null);

            return treeData;
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
                    this.props.clickOnMapSuccess && this.props.clickOnMapSuccess();
                }
            } else {
                alert('You have finished this activity!');
            }
        } else {
            alert('This map does not allow you to click on node');
        }
    }

    render = () => {
        return (
            <D3Tree
                treeData={this._treeData()}
                onClick={this._handleClickOnMap}
                canClickOnNode={this.props.canClickOnNode} />
        );
    }
};

function mapStateToProps(state) {
    return {
        activity: state.activity,
        user: state.user,
        story: state.story,
        auth: state.auth
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(ActivityActions, dispatch)
    };
}

export default ActivityTree;
