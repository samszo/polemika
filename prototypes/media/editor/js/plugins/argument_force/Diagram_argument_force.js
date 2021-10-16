class Diagram_argument_force extends Diagram {

    constructor(params) {
        super(params);
		this.model = new DiagramModel_force();
    }
	createBuilder() {
		return new DiagramBuilder_force(this);
	}
	normalizeData(data) {
	    var id = 0;
	    $.each(data.nodes, function(index, node) {
	        if (node.id == null)
	            node.id = id++;
	        if (node.x != null)
	            delete node["x"];
	        if (node.y != null)
	            delete node["y"];
	    });
	    $.each(data.links, function(index, link) {
	        if (link.id == null)
	            link.id = id++;
	        if (link.source == null)
	            link.source = link.src;
	        if (link.target == null)
	            link.target = link.dst;
	    });
	}
	/* overridden */
	updateGraph() {
	    var self = this;
        var graph = this.getData();

        var simulation = d3
            .forceSimulation(graph.nodes)
            .force("link", d3.forceLink()
                .id(function(d) {
                    return d.id;
                })
                .links(graph.links)
            )
            .force("charge", d3.forceManyBody().strength(-30))
            .force("center", d3.forceCenter(self.svgWidth / 2, self.svgHeight / 2))
            //.force("collide", d3.forceCollide(15))
            .on("tick", ticked);

        var link = self.linksContainer
            .selectAll("line")
            .data(graph.links, d => d.id)
            .enter()
            .append("line")
            .attr("stroke", "#999")
            .attr("stroke-width", function(d) {
                return 3;
            });

        /*var nodeUpdate = self.nodesContainer
            .selectAll("circle")
            .data(graph.nodes, d => d.id)
            .each(function(data, index) {
				var node = self.builder.gotInstance($(this), data, self);
				node.renderUpdate();
			});
		*/


        var node = self.nodesContainer
            .selectAll("circle")
            .data(graph.nodes, d => d.id)
            .enter()
            .append("circle")
            .attr("r", 5)
            .attr("fill", function(d) {
                return "red";
            })
            .call(
                d3
                .drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
            );

        function ticked() {
            link
                .attr("x1", function(d) {
                    return d.source.x;
                })
                .attr("y1", function(d) {
                    return d.source.y;
                })
                .attr("x2", function(d) {
                    return d.target.x;
                })
                .attr("y2", function(d) {
                    return d.target.y;
                });

            node
                .attr("cx", function(d) {
                    return d.x;
                })
                .attr("cy", function(d) {
                    return d.y;
                });
        }

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
	}
	computeNodeStyle(d3Node) {
		var self = this;
		d3Node
		.attr('stroke', function(d) {
			var instance = self.builder.gotInstance($(this).parent(), d, self);
			var styleTable = instance.getStyleTable();
			var s = styleTable["border-color"];
			if (s == null)
				s = "rgba("+self.styles[0]["concept-style"]["border-color"]+")";
			//let s = "rgba("+self.styles[0]["concept-style"]["border-color"]+")";
			//if(d.style) s = d.style['border-color'] ? "rgba("+d.style['border-color']+")" : s;
			//if(d.type=="linking-phrase")s = "none";
			return s;
		})
		//.attr('stroke-width',self.styles[0]["concept-style"]["border-thickness"])
		.attr('stroke-width', function(d) {
			var instance = self.builder.gotInstance($(this).parent(), d, self);
			var styleTable = instance.getStyleTable();
			var s = styleTable["border-width"];
			if (s == null)
				s = self.styles[0]["concept-style"]["border-thickness"];
			return s;
		})
		.attr('fill', function(d) {
			var instance = self.builder.gotInstance($(this).parent(), d, self);
			var styleTable = instance.getStyleTable();
			var s = styleTable["background-color"];
			if (s == null)
				s = "rgba("+self.styles[0]["concept-style"]["background-color"]+")";
			//let s = "rgba("+self.styles[0]["concept-style"]["background-color"]+")";
			//if(d.style) s = d.style['color'] ? d.style['color'] : s;
			//if(d.type=="linking-phrase")s = "white";
			return s
		});
	}
	computeNodeSize(domElt, nodeData) {
		//récupère la taille du texte
		let dNode = d3.select(domElt);
		let dLinkLayer = d3.select("#linksLayer"+nodeData.id);
		let dText = d3.select("#labelNode"+nodeData.id);
		let dRect = d3.select("#rectNode"+nodeData.id);
		let bb = dText.node().getBBox();
		let marge = 4; //let marge = parseInt(this.styles[0]["concept-style"]["text-margin"]);

		let layerBorderMargin = 10;
		let textBorderMargin = 2;

		let textWidth = bb.width+(marge*2);
		let textHeight = bb.height+(marge*2);
		let rectWidth = textWidth + textBorderMargin*2;
		let rectHeight = textHeight + textBorderMargin*2;
		let layerWidth = rectWidth + layerBorderMargin*2;
		let layerHeight = rectHeight + layerBorderMargin*2;
		//let textX = -marge;
		//let textY = -marge-self.styles[0]["concept-style"]["font-size"];
		dLinkLayer
			//.attr('cx',0)
			//.attr('cy',0)
			//.attr('fill','transparent')
			.attr('width', layerWidth)
			.attr('height', layerHeight);
		dRect
			.attr('x', layerBorderMargin)
			.attr('y', layerBorderMargin)
			.attr('width', rectWidth)
			.attr('height', rectHeight);
		dText
			//.attr('text-anchor','start')
			.attr('x', layerBorderMargin + textBorderMargin + marge)
			.attr('y', layerBorderMargin + textBorderMargin + textHeight/2 + marge)
			.attr('width', textWidth)
			.attr('height', textHeight);

		//let nodeBox = dNode.node().getBBox();
	}
	setLinkPosition(link, src, dst) {
		var self = this;

		var srcData = this.getNodeRectData(src);
		var dstData = this.getNodeRectData(dst);
		var w1 = srcData.width / 2;
		var h1 = srcData.height / 2;
		var w2 = dstData.width / 2;
		var h2 = dstData.height / 2;

		var cx1 = srcData.x + w1;
		var cy1 = srcData.y + h1;
		var cx2 = dstData.x + w2;
		var cy2 = dstData.y + h2;

		var dx = cx2 - cx1;
		var dy = cy2 - cy1;

		var p1 = this.getIntersection(dx, dy, cx1, cy1, w1, h1);
		var p2 = this.getIntersection(-dx, -dy, cx2, cy2, w2, h2);

		link.attr('x1', p1.x)
			.attr('y1', p1.y)
			.attr('x2', p2.x)
			.attr('y2', p2.y);
	}
	getIntersection(dx, dy, cx, cy, w, h) {
		if (Math.abs(dy / dx) < h / w) {
			// Hit vertical edge of box1
			return {
				x: cx + (dx > 0 ? w : -w),
				y: cy + dy * w / Math.abs(dx)
			};
		} else {
			// Hit horizontal edge of box1
			return {
				x: cx + dx * h / Math.abs(dy),
				y: cy + (dy > 0 ? h : -h)
			};
		}
	}
	getNodeRectData(d3Node) {
		var pt = this.svg.node().createSVGPoint();
		var data = d3Node.data()[0];
		pt.x = data.x;
		pt.y = data.y;
		var rectBox = d3Node.select(".rectNode").node().getBBox();
		var box = d3Node.node().getBBox();
		pt.x = pt.x + rectBox.x;
		pt.y = pt.y + rectBox.y;
		return {
			x: pt.x,
			y: pt.y,
			width: rectBox.width,
			height: rectBox.height
		};
	}
	changeNodeLabel($node, text) {
		var self = this;
		var nodeData = d3.select($node[0]).data()[0];
		self.model.notifyChange(nodeData);
		nodeData.label = text;
		$node.find("text").html(text)
		self.computeNodeSize($node[0], nodeData)
	}
	focus(domElt, data) {
		var self = this;
		var $elt = $(domElt);
		if ($elt.hasClass("linksLayer")) {
			if (self.linkCreation.source == null) {
				//console.log("focus linksLayer");
				d3.select(domElt).style("cursor", "pointer").transition().attr("fill-opacity", "0.5").duration(200);
			} else {
				//console.log("SET TARGET")
				var elt = d3.select(domElt);
				self.linkCreation.target = elt;
				elt.style("cursor", "pointer").transition().attr("fill-opacity", "0.5").duration(300);
			}
		}
		else if ($elt.hasClass("node")) {
			//console.log("node");
		}
	}
	unfocus(domElt, data) {
		var self = this;
		var $elt = $(domElt);
		if ($elt.hasClass("linksLayer")) {
			if (self.linkCreation.source == null) {
				//console.log("focus linksLayer");
				d3.select(domElt).style("cursor", "default").transition().attr("fill-opacity", "0").duration(200);
			} else {
				var elt = d3.select(domElt);
				//console.log("elt", elt);
				//console.log("self.linkCreation.source", self.linkCreation.source);
				if (self.linkCreation.source != elt) {
					elt.style("cursor", "default").transition().attr("fill-opacity", "0").duration(200);
					self.linkCreation.target = null;
					//console.log("set target null");
				}
			}
		}
	}
}