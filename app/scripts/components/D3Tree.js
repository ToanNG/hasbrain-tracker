import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

class D3Tree extends Component {

  componentDidMount = () => {
    this._showMap()
  }

  _showMap = () => {
    console.log('goi showMap trong D3Tree component');
    const {treeData, viewerWidth, viewerHeight} = this.props;

    var maxLabelLength = 0;
    var i = 0;
    var duration = 750;
    var root, node, defaultNode;
    var that = this;

    var tree = d3.layout.tree().size([viewerHeight, viewerWidth]);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) {
            return [d.y, d.x];
        });

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

    visit(treeData, function(d) {
        maxLabelLength = Math.max(d.name.length, maxLabelLength);
        if(d.nodeType === 'activity' && !d.isLocked && defaultNode === undefined){
          defaultNode = d;
        }
    }, function(d) {
        return d.children && d.children.length > 0 ? d.children : null;
    });

    function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    d3.select("svg").remove();
    var baseSvg = d3.select("#learning-tree").insert("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .attr("class", "overlay")
        .call(zoomListener);

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    function expand(d) {
      if (d._children) {
        d.children = d._children;
        d.children.forEach(expand);
        d._children = null;
      }
    }

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

    function toggleChildren(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        return d;
    }

    function click(d) {
      if (d3.event.defaultPrevented) return; // click suppressed
      console.log(d);
    }

    function update(source) {
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
        var newHeight = d3.max(levelWidth) * 25; 
        tree = tree.size([newHeight, viewerWidth]);

        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        nodes.forEach(function(d) {
            d.y = (d.depth * (maxLabelLength * 10));
        });

        node = svgGroup.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id || (d.id = ++i);
            });

        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click);

        nodeEnter.append("circle")
            .attr('class', 'nodeCircle');

        nodeEnter.append("text")
            .attr("x", function(d) {
                return d.children && d.children.length ? -10 : 10;
            })
            .attr("y", function(d) {
                return d.children && d.children.length ? -10 : 0;
            })
            .attr("dy", ".35em")
            .attr('class', 'nodeText')
            .attr("text-anchor", function(d) {
                return d.children && d.children.length ? "middle" : "start";
            })
            .text(function(d) {
                return d.name;
            })
            .style("fill-opacity", 0)
            .style("text-decoration", function(d){
              return d.isComplete ? "line-through" : "none";
            })
            .style("fill", function(d){
              return d.nodeType === "course" ? "#ddd" : "#000";
            });

        node.select('text')
          .attr("x", function(d) {
              return d.children && d.children.length > 0 ? -10 : 10;
          })
          .attr("y", function(d) {
              return d.children && d.children.length > 0 ? -10 : 0;
          })
          .attr("text-anchor", function(d) {
              return d.children && d.children.length ? "middle" : "start";
          });

        node.select("circle.nodeCircle")
          .attr("r", function(d){
            return (d.nodeType === "course") ? 3 : 4.5;
          })
          .style("fill", function(d) {
            return (d.nodeType === "course" ? "#ddd" : (d.isComplete ? "#ddd" : ( d.isLocked ? "#CCC" : "#fff")));
          })
          .style("stroke", function(d) {
            return d.nodeType === "course" || d.isLocked ? "none" : "steelblue";
          });

        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        nodeUpdate.select("text")
            .style("fill-opacity", function(d){
              return d.isComplete ? 0.5 : 1;
            });

        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 0);

        nodeExit.select("text")
            .style("fill-opacity", 0);

        var link = svgGroup.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });

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

        link.transition()
            .duration(duration)
            .attr("d", diagonal);

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

        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    var svgGroup = baseSvg.append("g");

    root = treeData;
    root.x0 = viewerHeight / 2;
    root.y0 = 0;

    update(root);
    if(defaultNode) {
      centerNode(defaultNode);
    } else {
      centerNode(root);
    }
  }

  render = () => {
    return (
      <div id="learning-tree"></div>
    );
  }
}

export default D3Tree;
