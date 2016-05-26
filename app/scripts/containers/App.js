import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import RouteCSSTransitionGroup from 'containers/RouteCSSTransitionGroup';
import { switchTo } from 'containers/Router';
import ImageComponent from 'components/Image';
import * as AuthActions from 'actions/auth';
import FontIcon from 'material-ui/lib/font-icon';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';

@connect(
  mapStateToProps,
  mapDispatchToProps
)
class App extends Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
    switchTo: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
  }

  state = {
    openDialog: false
  }

  componentDidMount = () => {
    this.props.actions.retrieveToken();
  }

  componentWillReceiveProps = (nextProps, nextContext) => {
    const { auth: thisAuth, user: thisUser, switchTo, actions} = this.props;
    const { auth: nextAuth, user: nextUser } = nextProps;

    if (thisAuth.get('isLoggedIn') !== nextAuth.get('isLoggedIn')) {
      if (nextAuth.get('isLoggedIn')) {
        actions.setToken(nextAuth.get('token'));
        switchTo('home');
      } else {
        switchTo('login');
      }
    }

    if (thisUser.get('currentUser') !== nextUser.get('currentUser')) {
      if (!nextUser.get('currentUser').enrollments) {
        switchTo('enroll');
      }
    }
  }

  showMap = () => {
    var treeData = {
      "_id" : this.props.user.get('currentUser').enrollments[0].learningPath._id,
      "name": this.props.user.get('currentUser').enrollments[0].learningPath.name, // root name
      "children" : JSON.parse(this.props.user.get('currentUser').enrollments[0].learningPath.nodeTree)
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
            for (var i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);
            }
        }
    }

    // Call visit function to establish maxLabelLength
    visit(treeData, function(d) {
        totalNodes++;
        maxLabelLength = Math.max(d.name.length, maxLabelLength);

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

    // Toggle children on click.
    function callback(nodeID){
        console.log(nodeID);
    }

    function click(d) {
        if (d3.event.defaultPrevented) return; // click suppressed
        callback(d._id);
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
                return d._children ? "lightsteelblue" : "#fff";
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

        // phantom node to give us mouseover in a radius around it
        nodeEnter.append("circle")
            .attr('class', 'ghostCircle')
            .attr("r", 30)
            .attr("opacity", 0.2) // change this to zero to hide the target area
        .style("fill", "red")
            .attr('pointer-events', 'mouseover')
            .on("mouseover", function(node) {
                overCircle(node);
            })
            .on("mouseout", function(node) {
                outCircle(node);
            });

        // Change the circle fill depending on whether it has children and is collapsed
        node.select("circle.nodeCircle")
            .attr("r", 4.5)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
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

  _handleTouchTap = () => {
    this.setState({
      openDialog: true
    }, () => {
      this.showMap();
    });
  }

  _handleClose = () => {
    this.setState({
      openDialog: false
    });
  }

  render = () => {
    const { openDialog } = this.state;

    const actions = [
      <FlatButton
        label='Cancel'
        secondary={true}
        onTouchTap={this._handleClose}
      />
    ];

    return (
      <div>
        <RouteCSSTransitionGroup transitionName='screen' transitionEnterTimeout={500} transitionLeaveTimeout={250}>
          {this.props.children}
        </RouteCSSTransitionGroup>

        <footer className='footer'>
          <small>&copy; 2015 hasBrain</small>
          {(() => {
            if (this.props.user.get('currentUser') && this.props.user.get('currentUser').enrollments) {
              return (<button onTouchTap={this._handleTouchTap}>{<FontIcon className='material-icons'>map</FontIcon>}</button>);
            }
          })()}
        </footer>

        <Dialog
          actions={actions}
          modal={false}
          open={openDialog}
          onRequestClose={this._handleClose}
        >
          <h2 className="text-center">Your learning path</h2>
          <div id="learning-tree" ref={node => {this.learningTree = node}}></div>
        </Dialog>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    user: state.user,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    switchTo: bindActionCreators(switchTo, dispatch),
    actions: bindActionCreators(AuthActions, dispatch),
  };
}

export default App;
