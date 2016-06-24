import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import Paper from 'material-ui/lib/paper';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import ImageComponent from 'components/Image';
import * as EnrollmentActions from 'actions/enrollment';
import * as LearningPathActions from 'actions/learningPath';

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
  }

  state = {
    openDialog: false,
    selectedPath: Map()
  }

  componentDidMount = () => {
    this._getLearningPaths();
  }

  _getLearningPaths = () => {
    const {auth, pathActions} = this.props;
    const token = auth.get('token');
    pathActions.getLearningPaths(token);
  }

  _handleTouchTap = (value, e) => {
    this.setState({
      openDialog: true,
      selectedPath: value
    }, () => {
        if(value && value.get('nodeTree')){
            this.drawTree(value);
        }
    });
  }

  _handleSubmit = () => {
    const {auth, enrollmentActions} = this.props;
    const token = auth.get('token');
    enrollmentActions.enroll(token, this.state.selectedPath.get('_id'));
  }

  _handleClose = () => {
    this.setState({
      openDialog: false
    });
  }

  drawTree = (value) => {
    const {auth, enrollmentActions} = this.props;
    var that = this;

    var treeData = {
      "_id" : value.get('_id'),
      "name":value.get('name'), // root name
      "children" : JSON.parse(value.get('nodeTree'))
    };

    // Calculate total nodes, max label length
    var totalNodes = 0;
    var maxLabelLength = 0;
    // Misc. variables
    var i = 0;
    var duration = 750;
    var root, node;

    // size of the diagram
    var viewerWidth = 720;
    var viewerHeight = 250;

    var tree = d3.layout.tree()
        .size([viewerHeight, viewerWidth]);

    // define a d3 diagonal projection for use by the node paths later on.
    var diagonal = d3.svg.diagonal()
        .projection(function(d) {
            return [d.y, d.x];
        });

    // A recursive helper function for performing some setup by walking through all nodes

    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;

        visitFn(parent);

        var children = childrenFn(parent);
        if (children) {
            var count = children.length;
            var numbDependency = 0;
            for (var i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);
                if(children[i].isDependency){
                  numbDependency++;
                }
            }
            if( numbDependency > 0 && parent.nodeType === 'course' ){
              parent.isDependency = true;
            } else {
              parent.isDependency = false;
            }
        }
    }

    // Call visit function to establish maxLabelLength
    visit(treeData, function(d) {
        totalNodes++;
        maxLabelLength = Math.max(d.name.length, maxLabelLength);
        d.dependency = d.dependency;
        if(!d.dependency || d.dependency && d.dependency.length === 0){
            d.isDependency = true;
        } else {
            d.isDependency = false;
        }
    }, function(d) {
        return d.children && d.children.length > 0 ? d.children : null;
    });


    // sort the tree according to the node names

    function sortTree() {
        tree.sort(function(a, b) {
            return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
        });
    }
    // Sort the tree initially incase the JSON isn't in a sorted order.
    sortTree();

    // Define the zoom function for the zoomable tree

    function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }


    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);


    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3.select("#learning-tree").append("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .attr("class", "overlay")
        .call(zoomListener);

    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

    function centerNode(source) {
        var scale = zoomListener.scale();
        var x = -source.y0;
        var y = -source.x0;
        x = x * scale + viewerWidth / 2;
        y = y * scale + viewerHeight / 2;
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
        zoomListener.scale(scale);
        zoomListener.translate([x, y]);
    }

    function click(node) {
        if (d3.event.defaultPrevented) return;
        if(!node.isDependency || node.dependency && node.dependency.length > 0){
            console.log('Does not meet the requirements!');
        } else {
            const token = auth.get('token');
            enrollmentActions.enroll(token, that.state.selectedPath.get('_id'), node._id);
        }
    }

    function update(source) {
        // Compute the new height, function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        var levelWidth = [1];
        var childCount = function(level, n) {

            if (n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);

                levelWidth[level + 1] += n.children.length;
                n.children.forEach(function(d) {
                    childCount(level + 1, d);
                });
            }
        };
        childCount(0, root);
        var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line  
        tree = tree.size([newHeight, viewerWidth]);

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Set widths between levels based on maxLabelLength.
        nodes.forEach(function(d) {
            d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
            // alternatively to keep a fixed scale one can set a fixed depth per level
            // Normalize for fixed-depth by commenting out below line
            // d.y = (d.depth * 500); //500px per level.
        });

        // Update the nodes…
        node = svgGroup.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click);

        nodeEnter.append("circle")
            .attr('class', 'nodeCircle')
            .attr("r", 0)
            .style("fill", function(d) {
                return d.children || d._children ? "lightsteelblue" : "#fff";
            });

        nodeEnter.append("text")
            .attr("x", function(d) {
                return d.children || d._children ? 10 : 10;
            })
            .attr("y", function(d) {
                return d.children || d._children ? -10 : 0;
            })
            .attr("dy", ".35em")
            .attr('class', 'nodeText')
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) {
                return d.name;
            })
            .style("fill-opacity", 0);

        // Change the circle fill depending on whether it has children and is collapsed
        node.select("circle.nodeCircle")
            .attr("r", 4.5)
            .style("fill", function(d) {
                return (!d.isDependency) ? "#CCC" : "#fff";
            });

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Fade the text in
        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Update the links…
        var link = svgGroup.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append("g");

    // Define the root
    root = treeData;
    root.x0 = viewerHeight / 2;
    root.y0 = 0;

    // Layout the tree initially and center on the root node.
    update(root);
    centerNode(root);
  }

  render = () => {
    const { openDialog, selectedPath } = this.state;
    const { learningPath } = this.props;

    if(learningPath.get('paths')) {
        const actions = [
          <FlatButton
            label='Cancel'
            secondary={true}
            onTouchTap={this._handleClose}
          />,
          <FlatButton
            label={`Pick ${selectedPath.get('name')}`}
            primary={true}
            keyboardFocused={true}
            onTouchTap={this._handleSubmit}
          />
        ];
        return (
          <div className='screen'>
            <ImageComponent className='wallpaper' src='https://d13yacurqjgara.cloudfront.net/users/43762/screenshots/1438974/ng-colab-space_night.gif' />
            <Paper className='enroll' zDepth={1}>
              <h2>Pick your path</h2>
              <List>
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
            >
              <div id="learning-tree" ref={node => {this.learningTree = node}}></div>
            </Dialog>
          </div>
        );
    }
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    learningPath: state.learningPath,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    enrollmentActions: bindActionCreators(EnrollmentActions, dispatch),
    pathActions: bindActionCreators(LearningPathActions, dispatch)
  };
}

export default Enroll;
