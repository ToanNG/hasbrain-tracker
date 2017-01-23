import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import Shepherd from 'tether-shepherd';
 

import Paper from 'material-ui/lib/paper';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import ImageComponent from 'components/Image';
import D3Tree from 'components/D3Tree';
import * as EnrollmentActions from 'actions/enrollment';
import * as LearningPathActions from 'actions/learningPath';
import * as UserActions from 'actions/user';

@connect(
    mapStateToProps,
    mapDispatchToProps
)
class Enroll extends Component {
    static propTypes = {
        auth: PropTypes.object.isRequired,
        learningPath: PropTypes.object.isRequired,
        enrollmentActions: PropTypes.object.isRequired,
        pathActions: PropTypes.object.isRequired,
        userActions: PropTypes.object.isRequired,
    }

    state = {
        openDialog: false,
        selectedPath: Map(),
        tour: new Shepherd.Tour({
            defaults: {
                classes: 'shepherd-theme-arrows',
                scrollTo: true,
                showCancelLink: true
            }
        })
    }

    componentWillReceiveProps = (nextProps) => {
        const thisUser = this.props.user.get('currentUser');
        const nextUser = nextProps.user.get('currentUser');
        if (nextUser !== thisUser && nextUser) {
            var oldUser = UserKit.getCurrentProfile();
            var name = '';
            if(nextUser.name && nextUser.name.first && nextUser.name.last) {
                name = nextUser.name.first + ' ' + nextUser.name.last;
            }
            UserKit.createNewProfile(nextUser._id, { email: nextUser.email, name: name }, function(){
                var curUser = UserKit.getCurrentProfile();
                if(oldUser !== curUser) {
                    UserKit.alias(oldUser, function(){
                        console.log('Created alias successfully!');
                    });
                }
                console.log('Profile ID: ', curUser);
            });
        }
    }

    componentDidMount = () => {
        this._getLearningPaths();
        const {auth, userActions, user} = this.props;
        const currentUser = user.get('currentUser');

        if(currentUser.levelTips < 1) {
            const { tour } = this.state;

            tour.on('complete', function(){
                tour.getById('learningNodeOverview').destroy();
                const token = auth.get('token');
                userActions.updateLevelTips(token, 1);
            });

            tour.addStep('learningPathOverview', {
              title: 'Choose your learning path',
              text: 'What do you want to learn?',
              attachTo: {element: '.enroll', on: 'left'},
              buttons: [
                {
                  text: 'Next',
                  action: tour.next,
                  classes: 'shepherd-button-example-primary'
                }
              ]
            });
            tour.addStep('learningPathDetail', {
              title: 'Learning path',
              text: 'Click on learning path to view what you gonna learn',
              attachTo: {element: '.enroll_list', on: 'top'},
              buttons: [
                {
                  text: 'OK',
                  action: tour.hide
                }
              ]
            });
            tour.addStep('learningNodeOverview', {
              title: 'Learning node',
              text: 'This is what you gonna learn',
              attachTo: {element: '.defaultNode', on: 'left'},
              buttons: [
                {
                  text: 'OK',
                  action: tour.next
                }
              ]
            });

            tour.start();
        }
    }

    _getLearningPaths = () => {
        const {auth, pathActions} = this.props;
        const token = auth.get('token');
        pathActions.getLearningPaths(token);
    }

    getOffset = ( el ) => {
        var _x = 0;
        var _y = 0;
        while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
            _x += el.offsetLeft - el.scrollLeft;
            _y += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }
        return { top: _y, left: _x };
    }

    _handleTouchTap = (value, e) => {
        this.setState({
            openDialog: true,
            selectedPath: value
        }, function(){
            var that = this;
            setTimeout(function(){
                that.state.tour.show('learningNodeOverview');
            }, 1000);
        });
    }

    _handleSubmit = () => {
        const {auth, enrollmentActions} = this.props;
        const token = auth.get('token');
        enrollmentActions.enroll(token, this.state.selectedPath.get('_id'));
    }

    _handleClose = () => {
        this.setState({ openDialog: false });
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
        const selectedPath = this.state.selectedPath;
        var treeData;

        if(selectedPath.get('_id')) {
            treeData = {
                "_id" : this.state.selectedPath.get('_id'),
                "name": this.state.selectedPath.get('name'),
                "nodeType" : "course",
                "isCollapse" : false,
                "isComplete" : false,
                "isLocked" : false,
                "children" : JSON.parse(this.state.selectedPath.get('nodeTree')),
            };

            // Detect nodes which should collapse
            this._recursive(treeData, function(d) {
                var children = d.children;
                if (children) {
                    var count = children.length;
                    var numbNodeHaveDependency = 0;
                    for (var i = 0; i < count; i++) {
                        if(children[i].dependency && children[i].dependency.length > 0){
                          numbNodeHaveDependency++;
                        }
                    }
                    if(d.nodeType === "course" && count === numbNodeHaveDependency) {
                        d.isCollapse = true;
                    }
                }
                
                if(d.dependency && d.dependency.length > 0){
                    d.isLocked = true;
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
        }

        return treeData;
    }

    _handleClickOnMap = (d, canClickOnNode) => {
        if(canClickOnNode) {
            const { auth, enrollmentActions } = this.props;
            if(!d.isComplete && d.nodeType === 'activity') {
                if(d.dependency && d.dependency.length > 0 && d.isLocked){
                    alert('Does not meet the requirements! You must finish another nodes to active this one!');
                } else {
                    UserKit.track('start_knowledge', {timestamp: new Date().getTime(), learning_path: this.state.selectedPath.get('_id')});
                    UserKit.track('start_excercise', {timestamp: new Date().getTime(), activity_id: d._id});
                    const token = auth.get('token');
                    enrollmentActions.enroll(token, this.state.selectedPath.get('_id'), d._id);
                }
            } else {
                alert('You have finished this activity!');
            }
        } else {
            alert('This map does not allow you to click on node');
        }
    }

    render = () => {
        const { openDialog, selectedPath } = this.state;
        const { learningPath } = this.props;

        if(!learningPath.get('paths')) return;
        const actions = [
            <FlatButton
                label='Close'
                secondary={true}
                onTouchTap={this._handleClose}
            />
        ];
        return (
            <div className='screen'>
                <ImageComponent className='wallpaper' src='https://d13yacurqjgara.cloudfront.net/users/43762/screenshots/1438974/ng-colab-space_night.gif' />
                <Paper className='enroll' zDepth={1}>
                    <h2>Pick your path</h2>
                    <List className='enroll_list'>
                        {learningPath.get('paths').map(path =>
                        <ListItem
                            key={path.get('_id')}
                            primaryText={path.get('name')}
                            onTouchTap={this._handleTouchTap.bind(null, path)}
                        />
                        )}
                    </List>
                </Paper>

                 <Dialog
                    actions={actions}
                    modal={false}
                    open={openDialog}
                    onRequestClose={this._handleClose}
                    bodyStyle={{padding:0}}
                    contentStyle={{width: '100%', maxWidth: 'none', height: '100%', maxHeight: 'none', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}
                    actionsContainerStyle={{position: 'absolute', bottom: 0, left: 0, backgroundColor: '#fff', marginBottom: 0}}
                    autoDetectWindowHeight={false}
                >
                    <D3Tree
                        treeData={this._treeData()}
                        onClick={this._handleClickOnMap}
                        canClickOnNode={true}
                     />
                </Dialog>
            </div>
        );
    }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    learningPath: state.learningPath,
    user: state.user,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    enrollmentActions: bindActionCreators(EnrollmentActions, dispatch),
    pathActions: bindActionCreators(LearningPathActions, dispatch),
    userActions: bindActionCreators(UserActions, dispatch)
  };
}

export default Enroll;
