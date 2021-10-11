class Diagram_argument extends Diagram {

    constructor(params) {
        super(params);
		this.model = new DiagramModel_argument();
    }
	createBuilder() {
		return new DiagramBuilder_argument(this);
	}
	/* overridden */
	updateGraph() {
		var self = this;
		//construction des noeuds
		self.nodesData = self.nodesContainer.selectAll("g").data(self.data.nodes, d => d.id);
		self.nodesData.exit().remove();
		// create node containers
		self.nodeContainers = self.nodesData.enter().append("g")
			.attr("class", "node")
			.attr("id", d => "gNode"+d.id)
			.attr("transform",d=>"translate("+d.x+","+d.y+")")
			.on("mouseover", function(d) {
				self.focus(this, d);
			}).on("mouseout", function(d) {
				self.unfocus(this, d);
//			}).on('click', function(event, data) {
//				self.clickOn(this, event, data, true);
			}).style("cursor", "pointer")
			.call(
				d3.drag()
					.on("start", function(event, d) {
						self.dragNodeStarted(this, event, d);
					}).on("drag", function(event, d) {
						self.draggingNode(this, event, d);
					}).on("end", function(event, d) {
						self.dragNodeEnded(this, event, d);
					})
			);
		// create link layers
		self.nodeContainers.append("rect")
			.attr("class", "linksLayer")
			.attr("id", d=>"linksLayer"+d.id)
			.attr("stroke", "rgba(255,150,0,255)")
			.attr("fill-opacity", "0")
			.on("mouseover", function(d) {
				self.focus(this, d);
			}).on("mouseout", function(d) {
				self.unfocus(this, d);
			}).call(
				d3.drag()
					.on("start", function(event, d) {
						self.dragLinkStarted(this, event, d);
					}).on("drag", function(event, d) {
						self.draggingLink(this, event, d);
					}).on("end", function(event, d) {
						self.dragLinkEnded(this, event, d);
					})
			);

		//construction des enveloppes
		self.nodeContainers.append("rect")
			.attr("class", "rectNode")
			.attr("id", d=>"rectNode"+d.id)
			.attr("fill", "white")
			.on('click', function(event, data) {
				console.log("rect->click");
				self.clickOn($(this).parent()[0], event, data, true);
			}).on("contextmenu", function (event, data) {
				console.log("rect->contextmenu");
				event.preventDefault();
				self.clickOn($(this).parent()[0], event, data, false);
			}).each(function(d,i) {
				var rect = d3.select(this);
				self.computeNodeStyle(rect);
			});
			//.style("pointer-events", "none"); // to prevent mouseover/drag capture

		//construction des labels
		self.nodeContainers.append('text')
			.attr("class", "labelNode")
			.attr("id", d=>"labelNode"+d.id)
			.attr('font-size',self.styles[0]["concept-style"]["font-size"])
			.attr('font-family',self.styles[0]["concept-style"]["font-name"])
			//.style('stroke',style[0]["concept-style"]["border-color"])
			.attr('fill',d=>{
				let s = "rgba("+self.styles[0]["concept-style"]["font-color"]+")";
				//s = "none";
				if(d.style) s = d.style['fgTextColor'] ? d.style['fgTextColor'] : s;
				return s
			})
			.style("pointer-events", "none") // to prevent mouseover/drag capture
			.html(function(d) {
				return d.label;
			});

		//redimensionne les enveloppes
		self.nodeContainers.each(function(d,i) {
			self.computeNodeSize(this, d);
		});
		self.linksData = self.linksContainer.selectAll("line").data(self.data.links, d => d.id);

		//construction des liens
		self.linksData.exit().remove();
		self.link = self.linksData
			.enter()
			.append("line")
			.attr("class", "link")
			.attr('stroke',d=>{
				let s = "rgba("+self.styles[0]["connection-style"]["color"]+")";
				if(d.style) s = d.style['color'] ? d.style['color'] : s;
				return s
			})
			.attr('stroke-width',d=>{
				let s = self.styles[0]["connection-style"]["thickness"]+"px";
				if(d.style) s = d.style['thickness'] ? d.style['thickness'] : s;
				return s
			})
			.attr("marker-end",'url(#head)')
			.attr('x1',d=>{
				return 10;
			})
			.attr('y1',(d,i)=>{
				return 10*i;
			})
			.attr('x2',(d,i)=>{
				return 100*i
			})
			.attr('y2',d=>{
				return 100;
			}).on('click', function(event, data) {
				self.clickOn(this, event, data, true);
			}).each(function(d,i) {
				// define source and target data
				let src = d3.select("#gNode"+d.src);
				let dst = d3.select("#gNode"+d.dst);
				var link = d3.select(this);

				var instance = self.builder.gotInstance($(this), d, self);
				instance.sourceNode = src;
				instance.targetNode = dst;
				//d.sourceNode = src;
				//d.targetNode = dst;
				var targetNode = self.builder.gotInstance($(dst.node()), d, self);
				targetNode.inputs.push(instance);
				//var dstData = dst.data()[0]
				//var inputs = dstData.inputs;
				//if (inputs == null) {
				//	inputs = [];
				//	dstData.inputs = inputs;
				//}
				//inputs.push(link);
				var sourceNode = self.builder.gotInstance($(src.node()), d, self);
				sourceNode.outputs.push(instance);
				//var srcData = src.data()[0];
				//var outputs = srcData.outputs;
				//if (outputs == null) {
				//	outputs = [];
				//	srcData.outputs = outputs;
				//}
				//outputs.push(link);
				// first position definition
				self.setLinkPosition(d3.select(this), src, dst);
			});
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
		let marge = parseInt(this.styles[0]["concept-style"]["text-margin"]);

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