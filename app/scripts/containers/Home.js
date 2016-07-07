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
  }

  componentDidMount = () => {
    console.log('goi get user')
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
    const thisUser = this.props.user.get('currentUser');
    const nextUser = nextProps.user.get('currentUser');

    if (nextUser !== thisUser && nextUser) {
      console.log(`Subscribing to channel hasbrain_test_${nextUser._id} ...`);
      pubnub.subscribe({
        channel: `hasbrain_test_${nextUser._id}`,
        message: (message, env, ch, timer, magic_ch) => {
          this._handleOpenDialog(message.text);
        },
      });
    }

    if(nextUser && nextUser.enrollments && nextProps.story.get('stories')){
      console.log('enrollment da co, show learning tree');
      this.setState({showLearningTree: true}, () => {
        this._showMap();
      });
    }

    /*
    if(thisUser && thisUser.enrollments){
      const thisPath = this.props.learningPath.get('path');
      const nextPath = nextProps.learningPath.get('path');
      if(nextPath !== thisPath && nextPath) {
        this._showMap();
      }

      const thisStory = this.props.story.get('stories');
      const nextStory = nextProps.story.get('stories');
      if(nextStory !== thisStory && nextStory) {
        console.log('loadedMap');
        this.setState({loadedMap: true}, () => {
          this._showMap();
        });
      }
    }
    */
  }

  _getTodayActivity = () => {
    const {auth, actions} = this.props;
    const token = auth.get('token');
    actions.getTodayActivity(token);
  }

  _getUser = () => {
    const {auth, userActions} = this.props;
    const token = auth.get('token');
    console.log('_getUser');
    console.log(token);
    userActions.getUser(token); 
  }

  _getStory = () => {
    const {auth, storyActions} = this.props;
    const token = auth.get('token');
    storyActions.getCompleteStory(token);
    console.log('get story');
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

  _handleClickStart = () => {
    this.confirm.show();
  }

  _handleClickSkip = () => {
    const {auth, activity, actions} = this.props;
    const token = auth.get('token');
    const todayActivity = activity.get('todayActivity');
    actions.completeActivity(token, todayActivity._id);
  }

  _handleCountdownEnd = () => {
    const {auth, activity, actions} = this.props;
    const token = auth.get('token');
    const todayActivity = activity.get('todayActivity');
    actions.startActivity(token, todayActivity._id);
  }

  _handleSubmit = (repoUrl) => {
    const {auth, activity, actions} = this.props;
    const token = auth.get('token');
    const todayActivity = activity.get('todayActivity');
    actions.submitAnswer(token, todayActivity.storyId, repoUrl);
  }

  _handleOpenDialog = (message) => {
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

  _showMap1 = () => {
    const { story, auth, actions, activity, user } = this.props;
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
        "children" : JSON.parse(userData.learningPath.nodeTree),
      };

      // Detect nodes which is completed
      this._recursive(treeData, function(d) {
        d.isComplete = (completedActivityArr.indexOf(d._id) > -1) ? true : false;

        if(d.isComplete && completedNodes.indexOf(d._id) === -1){
          completedNodes.push(d._id);
        }
      }, (d) => d.children && d.children.length > 0 ? d.children : null);

      // Detect nodes which should collapse
      this._recursive(treeData, function(d) {
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

  _showMap = (canClickOnNode = true) => {
    // console.log('goi showMap');
    // const { story, auth, actions, activity, user } = this.props;

    // if(user.get('currentUser') && user.get('currentUser').enrollments && user.get('currentUser').enrollments.length > 0) {
    //   const completedActivityArr = story.get('stories') ? story.get('stories').map(function(story){
    //     return story.activity._id;
    //   }) : [];

    //   const todayActivity = activity.get('todayActivity');
    //   const currentUser = user.get('currentUser').enrollments[0] ? user.get('currentUser').enrollments[0] : { _id : 0, name : '', children : null};

    //   var treeData = {
    //     "_id" : currentUser.learningPath._id,
    //     "name": currentUser.learningPath.name, // root name
    //     "nodeType" : "course",
    //     "children" : JSON.parse(currentUser.learningPath.nodeTree)
    //   };

    //   var completedNodes = [];
    //   var maxLabelLength = 0;
    //   // Misc. variables
    //   var i = 0;
    //   var duration = 750;
    //   var root, node, defaultNode;
    //   var that = this;

    //   // size of the diagram
    //   var viewerWidth = 1392;
    //   var viewerHeight = 700;

    //   var tree = d3.layout.tree().size([viewerHeight, viewerWidth]);

    //   // define a d3 diagonal projection for use by the node paths later on.
    //   var diagonal = d3.svg.diagonal()
    //       .projection(function(d) {
    //           return [d.y, d.x];
    //       });

    //   // A recursive helper function for performing some setup by walking through all nodes
    //   function visit(parent, visitFn, childrenFn) {
    //       if (!parent) return;

    //       visitFn(parent);

    //       var children = childrenFn(parent);
    //       if (children) {
    //           var count = children.length;
    //           var numbCompleted = 0;
    //           for (var i = 0; i < count; i++) {
    //               visit(children[i], visitFn, childrenFn);
    //               if(children[i].isComplete){
    //                 numbCompleted++;
    //               }
    //           }
    //           if( count === numbCompleted ){
    //             parent.isComplete = true;
    //           } else {
    //             parent.isComplete = false;
    //           }
    //       }
    //   }

    //   // Call visit function to establish maxLabelLength
    //   visit(treeData, function(d) {
    //       maxLabelLength = Math.max(d.name.length, maxLabelLength);

    //       d.nodeType = d.nodeType;
    //       if( (completedActivityArr.indexOf(d._id) > -1) ) {
    //         d.isComplete = true;
    //       } else {
    //         d.isComplete = false;
    //       }

    //       if(d.isComplete){
    //         completedNodes.push(d._id);
    //       }

    //   }, function(d) {
    //       return d.children && d.children.length > 0 ? d.children : null;
    //   });

    //   // Loop through treeData to get all of completed nodes.
    //   visit(treeData, function(d) {
    //       if(d.isComplete && completedNodes.indexOf(d._id) === -1){
    //         completedNodes.push(d._id);
    //       }

    //       var children = d.children;
    //       if (children) {
    //           var count = children.length;
    //           var numbNodeHaveDependency = 0;
    //           for (var i = 0; i < count; i++) {
    //               if(children[i].dependency && children[i].dependency.length > 0 && completedNodes.filter(function (elem) { return children[i].dependency.indexOf(elem) > -1; }).length != children[i].dependency.length){
    //                 numbNodeHaveDependency++;
    //               }
    //           }
    //           if(d.nodeType === "course" && count === numbNodeHaveDependency) {
    //             collapse(d);
    //           }
    //       }

    //       if(d.nodeType === "activity" && d.isComplete === false) {
    //         if(d.dependency && d.dependency.length > 0){
    //           if(completedNodes.filter(function (elem) { return d.dependency.indexOf(elem) > -1; }).length === d.dependency.length){
    //             if(defaultNode === undefined) {
    //               defaultNode = d;
    //             }
    //           }
    //         } else {
    //           if(defaultNode === undefined) {
    //             defaultNode = d;
    //           }
    //         }
    //       }
    //   }, function(d) {
    //       return d.children && d.children.length > 0 ? d.children : null;
    //   });

    //   // Define the zoom function for the zoomable tree
    //   function zoom() {
    //       svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    //   }

    //   // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    //   var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    //   // define the baseSvg, attaching a class for styling and the zoomListener
    //   d3.select("svg").remove(); // remove the old one to not duplicated create when re-open
    //   var baseSvg = d3.select("#learning-tree").insert("svg")
    //       .attr("width", viewerWidth)
    //       .attr("height", viewerHeight)
    //       .attr("class", "overlay")
    //       .call(zoomListener);

    //   // Helper functions for collapsing and expanding nodes.
    //   function collapse(d) {
    //       if (d.children) {
    //           d._children = d.children;
    //           d._children.forEach(collapse);
    //           d.children = null;
    //       }
    //   }

    //   function expand(d) {
    //       if (d._children) {
    //           d.children = d._children;
    //           d.children.forEach(expand);
    //           d._children = null;
    //       }
    //   }

    //   // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.
    //   function centerNode(source) {
    //       var scale = zoomListener.scale();
    //       var x = -source.y0;
    //       var y = -source.x0;
    //       x = x * scale + viewerWidth / 2;
    //       y = y * scale + viewerHeight / 2;
    //       d3.select('g').transition()
    //           .duration(duration)
    //           .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
    //       zoomListener.scale(scale);
    //       zoomListener.translate([x, y]);

    //       //svgGroup.transition().attr("transform", "translate(1000, 1000)");
    //   }

    //    // Toggle children function
    //   function toggleChildren(d) {
    //       if (d.children) {
    //           d._children = d.children;
    //           d.children = null;
    //       } else if (d._children) {
    //           d.children = d._children;
    //           d._children = null;
    //       }
    //       return d;
    //   }

    //   function click(d) {
    //     if (d3.event.defaultPrevented) return; // click suppressed
    //     if(d.nodeType === 'course'){
    //       d = toggleChildren(d);
    //       update(d);
    //       centerNode(d);
    //     } else {
    //       if(canClickOnNode) {
    //         var flag = true;
    //         if(todayActivity) {
    //           const { startTime: isStarted } = todayActivity;
    //           if(isStarted) {
    //             alert('You must drop out current activity to select another one');
    //             centerNode(d);
    //             flag = false;
    //           }
    //         }

    //         if(!d.isComplete && d.nodeType === 'activity') {
    //           if(d.dependency && d.dependency.length > 0){
    //             d.dependency.map(function(id){
    //               if(completedNodes.indexOf(id) === -1){
    //                 alert('Does not meet the requirements! You must finish another nodes to active this one!');
    //                 centerNode(d);
    //                 flag = false;
    //                 return;
    //               }
    //             });
    //           }

    //           if(flag){
    //             const token = auth.get('token');
    //             actions.createActivity(token, d._id);
    //             that.setState({ openShowMapDialog: false, openSelectAnotherNode : false });
    //           }
    //         }
    //       }
    //     }
    //   }

    //   function update(source) {
    //       // Compute the new height, function counts total children of root node and sets tree height accordingly.
    //       // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
    //       // This makes the layout more consistent.
    //       var levelWidth = [1];
    //       var childCount = function(level, n) {

    //           if (n.children && n.children.length > 0) {
    //               if (levelWidth.length <= level + 1) levelWidth.push(0);

    //               levelWidth[level + 1] += n.children.length;
    //               n.children.forEach(function(d) {
    //                   childCount(level + 1, d);
    //               });
    //           }
    //       };
    //       childCount(0, root);
    //       var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line  
    //       tree = tree.size([newHeight, viewerWidth]);

    //       // Compute the new tree layout.
    //       var nodes = tree.nodes(root).reverse(),
    //           links = tree.links(nodes);

    //       // Set widths between levels based on maxLabelLength.
    //       nodes.forEach(function(d) {
    //           d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
    //           // alternatively to keep a fixed scale one can set a fixed depth per level
    //           // Normalize for fixed-depth by commenting out below line
    //           // d.y = (d.depth * 500); //500px per level.
    //       });

    //       // Update the nodes…
    //       node = svgGroup.selectAll("g.node")
    //           .data(nodes, function(d) {
    //               return d.id || (d.id = ++i);
    //           });

    //       // Enter any new nodes at the parent's previous position.
    //       var nodeEnter = node.enter().append("g")
    //           .attr("class", "node")
    //           .attr("transform", function(d) {
    //               return "translate(" + source.y0 + "," + source.x0 + ")";
    //           })
    //           .on('click', click);

    //       nodeEnter.append("circle")
    //           .attr('class', 'nodeCircle');

    //       nodeEnter.append("text")
    //           .attr("x", function(d) {
    //               return d.children && d.children.length ? -10 : 10;
    //           })
    //           .attr("y", function(d) {
    //               return d.children && d.children.length ? -10 : 0;
    //           })
    //           .attr("dy", ".35em")
    //           .attr('class', 'nodeText')
    //           .attr("text-anchor", function(d) {
    //               return d.children && d.children.length ? "middle" : "start";
    //           })
    //           .text(function(d) {
    //               return d.name;
    //           })
    //           .style("fill-opacity", 0)
    //           .style("text-decoration", function(d){
    //             return d.isComplete ? "line-through" : "none";
    //           })
    //           .style("fill", function(d){
    //             return d.nodeType === "course" ? "#ddd" : "#000";
    //           });

    //         // Update the text to reflect whether node has children or not.
    //         node.select('text')
    //           .attr("x", function(d) {
    //               return d.children && d.children.length > 0 ? -10 : 10;
    //           })
    //           .attr("y", function(d) {
    //               return d.children && d.children.length > 0 ? -10 : 0;
    //           })
    //           .attr("text-anchor", function(d) {
    //               return d.children && d.children.length ? "middle" : "start";
    //           });

    //       // Change the circle fill depending on whether it has children and is collapsed
    //       // Style for node 
    //       node.select("circle.nodeCircle")
    //           .attr("r", function(d){
    //             return (d.nodeType === "course") ? 3 : 4.5;
    //           })
    //           .style("fill", function(d) {
    //             return (todayActivity && d._id === todayActivity._id && that.state.openSelectAnotherNode === false) ? "#ff4081" : (d.nodeType === "course" ? "#ddd" : (d.isComplete ? "#ddd" : (d.dependency && d.dependency.length > 0) ? ( (completedNodes.filter(function (elem) { return d.dependency.indexOf(elem) > -1; }).length == d.dependency.length) ? "#fff" : "#CCC" ) : "#fff"));
    //           })
    //           .style("stroke", function(d) {
    //               return d.nodeType === "activity" && ((d.dependency && d.dependency.length > 0) ? ( (completedNodes.filter(function (elem) { return d.dependency.indexOf(elem) > -1; }).length == d.dependency.length) ? "steelblue" : "none" ) : "steelblue");
    //           });

    //       // Transition nodes to their new position.
    //       var nodeUpdate = node.transition()
    //           .duration(duration)
    //           .attr("transform", function(d) {
    //               return "translate(" + d.y + "," + d.x + ")";
    //           });

    //       // Fade the text in
    //       nodeUpdate.select("text")
    //           .style("fill-opacity", function(d){
    //             return d.isComplete ? 0.5 : 1;
    //           });

    //       // Transition exiting nodes to the parent's new position.
    //       var nodeExit = node.exit().transition()
    //           .duration(duration)
    //           .attr("transform", function(d) {
    //               return "translate(" + source.y + "," + source.x + ")";
    //           })
    //           .remove();

    //       nodeExit.select("circle")
    //           .attr("r", 0);

    //       nodeExit.select("text")
    //           .style("fill-opacity", 0);

    //       // Update the links…
    //       var link = svgGroup.selectAll("path.link")
    //           .data(links, function(d) {
    //               return d.target.id;
    //           });

    //       // Enter any new links at the parent's previous position.
    //       link.enter().insert("path", "g")
    //           .attr("class", "link")
    //           .attr("d", function(d) {
    //               var o = {
    //                   x: source.x0,
    //                   y: source.y0
    //               };
    //               return diagonal({
    //                   source: o,
    //                   target: o
    //               });
    //           });

    //       // Transition links to their new position.
    //       link.transition()
    //           .duration(duration)
    //           .attr("d", diagonal);

    //       // Transition exiting nodes to the parent's new position.
    //       link.exit().transition()
    //           .duration(duration)
    //           .attr("d", function(d) {
    //               var o = {
    //                   x: source.x,
    //                   y: source.y
    //               };
    //               return diagonal({
    //                   source: o,
    //                   target: o
    //               });
    //           })
    //           .remove();

    //       // Stash the old positions for transition.
    //       nodes.forEach(function(d) {
    //           d.x0 = d.x;
    //           d.y0 = d.y;
    //       });
    //   }

    //   // Append a group which holds all nodes and which the zoom Listener can act upon.
    //   var svgGroup = baseSvg.append("g");

    //   // Define the root
    //   root = treeData;
    //   root.x0 = viewerHeight / 2;
    //   root.y0 = 0;

    //   // Layout the tree initially and center on the root node.
    //   update(root);
    //   //centerNode(root.children[0].children[0]);
    //   centerNode(defaultNode);
    // }
  }

  _handleShowMapTap = () => {
    if(this.state.openShowMapDialog === false) {
      this.setState({
        openShowMapDialog: true
      }, () => {
        this._showMap(false);
      });
    }
  }

  _handleCloseShowMapDialog = () => {
    this.setState({
      openShowMapDialog: false
    });
  }

  _handleCloseGiveUpDialog = () => {
    this.setState({
      openGiveUpDialog: false
    });
  }

  _handleGiveUpTap = () => {
    this.setState({
      openGiveUpDialog: true
    }, () => {
      this._showMap();
    });
  }

  _handleReloadLearningTree = () => {
    this._showMap();
  }

  _handleFireGiveUpDialog = () => {
    const {auth, actions, activity} = this.props;
    const token = auth.get('token');
    const todayActivity = activity.get('todayActivity');
    actions.giveUpActivity(token, todayActivity._id);
    this.setState({
      openGiveUpDialog: false,  
      openSelectAnotherNode: true
    }, () => {
      this._showMap();
    });
  }

  render = () => {
    const {activity, user, pairing } = this.props;
    const todayActivity = activity.get('todayActivity');
    const isSubmitting = activity.get('isSubmitting');
    const currentUser = user.get('currentUser');
    const partner = pairing.get('pairing');
    let bodyContainer, footerContainer;

    if (!currentUser) return null;

    if(todayActivity) {
      const {
        company,
        parent: course,
        name,
        description,
        problem,
        knowledge,
        startTime: isStarted,
        isCompleted,
        tester
      } = todayActivity;
      let cardContent, companyContent, partnerContent, showMapButton;

      if (isStarted) {
        cardContent = <div>
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
        </div>;
      } else {
        cardContent = <div>
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
            (tester) ? 
            <CardText dangerouslySetInnerHTML={{__html: problem}} /> :
            <CardText dangerouslySetInnerHTML={{__html: knowledge}} />
          }
          <Divider />
          <CardActions>
            {
              (tester) ? 
                <FlatButton
                label='Learn this!'
                primary={true}
                onClick={this._handleClickStart} /> : 
                <div>
                  <FlatButton
                  label='Finish this activity'
                  primary={true}
                  onClick={this._handleClickSkip} />
                </div>
            }
          </CardActions>
        </div>;
      }

      if(company) {
        companyContent = <Card>
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
          </Card>;
      }

      if(partner) {
        const buddy = (currentUser._id === partner.studentA._id) ? partner.studentB : partner.studentA;
        partnerContent = <Card>
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
          </Card>;
      }

      bodyContainer = <div className='activity-card-container' style={(!company && !partner ) ? {maxWidth: 800} : {maxWidth: 1200}}>
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
                title={name}
                subtitle={course ? course.name : ''} />
              <CardText>
                {description}
              </CardText>
              {cardContent}
            </Card>
            <div className='company'>
              {companyContent}
              {partnerContent}
            </div>
          </div>;

      footerContainer = <div>
        <FloatingActionButton secondary={true} onTouchTap={this._handleShowMapTap} className='showMap'><FontIcon className='material-icons'>map</FontIcon></FloatingActionButton>
        {(!isCompleted) && <FloatingActionButton onTouchTap={this._handleGiveUpTap} className='giveUp'><FontIcon className='material-icons'>exit_to_app</FontIcon></FloatingActionButton>}
        
        <CountdownConfirm
          ref={(node) => {
            this.confirm = node;
          }}
          message={'The activity starts after [count]s'}
          action={'undo'}
          countdown={5}
          onCountdownEnd={this._handleCountdownEnd} />

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
          contentStyle={{width: '100%', maxWidth: 'none'}}
          autoDetectWindowHeight={false}
        >
          <div id="learning-tree"></div>
        </Dialog>

        <Dialog
          actions={[
            <FlatButton
              label='Reload learning tree'
              secondary={true}
              onTouchTap={this._handleReloadLearningTree} />,
          ]}
          modal={true}
          open={this.state.openSelectAnotherNode}
          contentStyle={{width: '100%', maxWidth: 'none'}}
          autoDetectWindowHeight={false}
          >
            <div id="learning-tree"></div>
        </Dialog>
      </div>;
    } else {
      footerContainer = <div><Dialog
          actions={[
            <FlatButton
              label='Reload learning tree'
              secondary={true}
              onTouchTap={this._handleReloadLearningTree} />,
          ]}
          modal={true}
          contentStyle={{width: '100%', maxWidth: 'none'}}
          //autoDetectWindowHeight={false}
          open={this.state.showLearningTree}
          >
          <D3Tree
            viewerWidth={1392}
            viewerHeight={500}
            treeData={this._showMap1()} />
          </Dialog>
          </div>
          ;
    }

    return (
      <div className='screen'>
        <ImageComponent className='wallpaper' src='https://d13yacurqjgara.cloudfront.net/users/64177/screenshots/2635137/simonas-maciulis_space2.png' />
        <div style={{position: 'relative', overflow:'auto'}}>
          {bodyContainer}
        </div>
        {footerContainer}
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
