class Diagram extends PSubject {

    constructor(params) {
		super();
		var self = this;
        self.editor = params.editor;
		self.builder = this.createBuilder();
		self.creationPanel = self.builder.createCreationPanel(self, params.archetypes);
		//self.cont = d3.select("#"+params.idCont);
		self.node = params.container;
		params.container.data("object", this);
		self.cont = d3.select(params.container[0]);
		self.editionMode = null;
		self.ongoingSelection = false;
		self.finalizeSelection = false;
        //self.width = params.width ? params.width : 600;
        //self.height = params.height ? params.height : 600;
        self.dataUrl = params.dataUrl ? params.dataUrl : false;
        self.kId = params.kId ? params.kId : 'o:id'; //identifiant omeka S
        self.kName = params.kName ? params.kName : 'o:title'; //title omeka S
        self.data = params.data ? params.data : {};
		self.styles = self.data.styles;
		self.color = d3.scaleOrdinal(d3.schemeCategory10);
		self.textMargin = parseInt(self.styles[0]["concept-style"]["text-margin"]);		
		self.linkCreation = {
			source : null,
			target : null
		}
		self.selection = [];
		//self.currentTransform = {x:0, y:0, k:1};

		self.initGraph();
		self.updateGraph();
		
		/*
		self.popup = self.createPopup($("svg .container"));
		var actions = {
			"supprimer" : function($rectNode) {
				console.log("supprimer", d3Node);
				var d3Node = d3.select($rectNode.parent()[0]);
				self.deleteNode(d3Node, true);
			},
			"autre" : function(d3Node) {
				console.log("autre action", d3Node);
			}
		}
		self.updatePopup(self.popup, actions);		
		*/
    }
	initGraph() {
		var self = this;
		//construction du svg
		self.svg = self.cont.append("svg")
			.attr("class", "svg")
			.attr("width", '100%')
			.attr("height", '100%')
			.attr('viewBox',0+' '+0+' '+self.data.w+' '+self.data.h)
			.attr('preserveAspectRatio','xMinYMin meet')
			.on('click', function(event, data) {				
				//console.log("svg->click");
				if (!self.finalizeSelection) {
					event.preventDefault();
					event.stopPropagation();
					self.clickOn(this, event, data, true);
				} else
					self.finalizeSelection = false;
			})
			.on("contextmenu", function (event, data) {
				//console.log("svg->contextmenu");
				if (!self.ongoingSelection) {
					event.preventDefault();
					event.stopPropagation();
					self.clickOn(this, event, data, false);
				}
			})
			.on("mousedown", function(event, data) {
				//console.log("svg->mousedown", event.button);
				if (self.editionMode == "selection") {
					self.ongoingSelection = true;
					var p = d3.pointer(event);
					var svg = self.svg;
					var rect = svg.append("rect").attr('rx', 6).attr('ry', 6).attr('class', "selection").attr('x', p[0]).attr('y', p[1]).attr('width', 0).attr('height', 0).attr('stroke', 'gray').attr('stroke-dasharray', '4px').attr('stroke-opacity', '0.5').attr('fill', 'transparent');
				}
				/*else if (!event.ctrlKey) {
					if (event.button == 2)
						event.preventDefault();
					self.clickOn(this, event, data, event.button != 2);
				}*/
			})
			.on("mousemove", function(event) {				
				var s = self.svg.select("rect.selection");
				if (!s.empty()) {
					var p = d3.pointer(event);
					var	d = {
						x: parseInt(s.attr("x"), 10),
						y: parseInt(s.attr("y"), 10),
						width: parseInt(s.attr("width"), 10),
						height: parseInt(s.attr("height"), 10)
					};
					var move = {
						x: p[0] - d.x,
						y: p[1] - d.y
					};
					if (move.x < 1 || (move.x * 2 < d.width)) {
						d.x = p[0];
						d.width -= move.x;
					} else
						d.width = move.x;
					d.width = Math.max(0, d.width);
					if (move.y < 1 || (move.y * 2 < d.height)) {
						d.y = p[1];
						d.height -= move.y;
					} else
						d.height = move.y;
					d.height = Math.max(0, d.height);
					for (var key in d)
						s.attr(key, d[key]);
					
					d3.selectAll('g.node').each(function(state_data, i) {
						if (!_.contains(self.selection, this)) {
							var d3Node = d3.select(this);
							var tX = parseInt(state_data.x);
							var tY = parseInt(state_data.y);
							if (self.currentTransform) {
								tX = tX * self.currentTransform.k;
								tY = tY * self.currentTransform.k;
								tX = tX + self.currentTransform.x;
								tY = tY + self.currentTransform.y;
							}
							var collision = 
								tX >= d.x && tX <= (parseInt(d.x) + parseInt(d.width)) &&
								tY >= d.y && tY <= (parseInt(d.y) + parseInt(d.height));
							if (!d3Node.classed("selectedNode") && collision)
								d3Node.classed("selectedNode", true);
							else if (d3Node.classed("selectedNode") && !collision)
								d3Node.classed("selectedNode", false);
						}
					});
					
				}
			})
			.on("mouseup", function(event, data) {
				//console.log("svg->mouseup", event.button);
				if (self.ongoingSelection) {
					self.finalizeSelection = true;
					self.ongoingSelection = false;
					var s = self.svg.select("rect.selection");
					if (!s.empty()) {
						s.remove();
						self.setSelection($.map($("g.selectedNode", this.node), function(obj) { return obj; }));
					}					
				}
			});

		//création des définitions
		self.defs = self.svg.append('defs');
		self.markers = [];
		self.markers[''] = self.defs.append('marker')
			.attr('id','head')
			.attr('orient','auto')
			.attr('markerWidth','2')
			.attr('markerHeight','4')
			.attr('refX','2') 
			.attr('refY','2')
				.append('path')
				.attr('d','M0,0 V4 L2,2 Z')
				.attr('fill','red');
		//création du conteneur
		self.container = self.svg.append("g").attr("class", "container");
		
		//création du fond
		self.container.append('rect')
			.attr("id", 'svgFond')
			.attr("x", 0).attr("y", 0)
			.attr("width", '100%')
			.attr("height", '100%')
			.attr('fill',"rgba("+self.styles[0]["map-style"]["background-color"]+")");
		// définition du zoom
		self.switchToEditionMode("zoom");
		self.nodesContainer = self.container.append("g").attr("class", "nodes");
		self.linksContainer = self.container.append("g").attr("class", "links");		
	}
	setZoomEnabled(enabled) {
		var self = this;
		if (enabled) {			
			if (this.zoom == null) {
				this.zoom = d3.zoom()			
					.scaleExtent([.1, 4])
					.on("zoom", function(event) {
						self.currentTransform = event.transform;
						self.container.attr("transform", event.transform);
					});
			}
			console.log("enable zoom");
			this.svg.call(this.zoom);
		} else {
			console.log("disable zoom");
			this.svg.on('.zoom', null);
		}
			
	}
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
	getWidth(d3Node) {
		var box = d3Node.node().getBBox();
		return box.width-this.textMargin;
	}
	addNode(nodeData, pos) {
		var self = this;
		if (self.currentTransform) {
			pos.x = pos.x - self.currentTransform.x;
			pos.y = pos.y - self.currentTransform.y;
			pos.x = pos.x / self.currentTransform.k;
			pos.y = pos.y / self.currentTransform.k;			
		}
		nodeData.x = pos.x;
		nodeData.y = pos.y;
		self.data.nodes.push(nodeData);
		this.updateGraph();
		return $("#gNode"+nodeData.id);
	}
	importData(url) {
		var self = this;
		$.ajax({
			url: url,
			dataType: "json",
			success: function (data) {
				$.each(data.nodes, function(index, nodeData) {
					var existingNode = _.find(self.data.nodes, function(elt) {
						return elt.id == nodeData.id;
					});
					if (existingNode == null)
						self.data.nodes.push(nodeData);
				});
				$.each(data.links, function(index, linkData) {
					var existingLink = _.find(self.data.links, function(elt) {
						return elt.id == linkData.id;
					});
					if (existingLink == null)
						self.data.links.push(linkData);
				});				
				self.updateGraph();
			}
		});		
	}
	deleteNode(d3Node, doesUpdate) {
		console.log("deleteNode");
		var self = this;
		var data = d3Node.data()[0];
		$.each(data.inputs, function(index, d3Link) {
			self.deleteLink(d3Link);
		});
		$.each(data.outputs, function(index, d3Link) {
			self.deleteLink(d3Link);
		});
		var index = self.data.nodes.indexOf(data);
		if (index > -1)
			self.data.nodes.splice(index, 1);
		if (doesUpdate == true)
			self.updateGraph();
	}
	deleteLink(d3Link, doesUpdate) {
		console.log("deleteLink");		
		var self = this;
		var data = d3Link.data()[0];
		var index = self.data.links.indexOf(data);
		if (index > -1)
			self.data.links.splice(index, 1);
		if (doesUpdate == true)
			self.updateGraph();
	}
	clickOn(domElt, event, data, leftClick) {
		var isSvg = domElt.tagName == "svg";
		if (!isSvg)
			event.stopPropagation(); // if a rectNode is clicked, stop progation to not take into account container click event (we don't want to deselect just after)
		var $elt = $(domElt);
		if (leftClick && this.linkCreation.source == null) {			
			if ($elt.hasClass("node") || $elt.hasClass("link")) {
				var selection = this.selection.slice();
				if (!event.ctrlKey)
					selection = [];
				selection.push(domElt);
				this.setSelection(selection);
			} else if ($elt.hasClass("svg")) {
				this.setSelection([]);
			}
		} else if (!leftClick) {			
			if (!isSvg) {
				if (!_.contains(this.selection, domElt))
					this.setSelection([domElt]);
			}
			this.notifyObservers({ name : "openContextualMenu", data: data, event: event });
		}
		
	}
	switchToEditionMode(editionMode) {
		if (this.editionMode != editionMode) {
			this.editionMode = editionMode;
			this.setZoomEnabled(editionMode == "zoom");
		}
	}
	getSelection() {
		return this.selection;
	}
	setSelection(selection) {
		var self = this;
		if (!_.isEqual(this.selection, selection)) {
			$.each(_.filter(selection, function(obj){ return !_.findWhere(self.selection, obj); }), function(index, obj) {
				$(obj).addClass("selectedNode");
			});
			$.each(_.filter(self.selection, function(obj){ return !_.findWhere(selection, obj); }), function(index, obj) {
				$(obj).removeClass("selectedNode");
			});
			this.selection = selection;
			this.notifyObservers({ name : "selectionChanged" });
		}
	}	
	changeNodeLabel($node, text) {
		var self = this;
		var nodeData = d3.select($node[0]).data()[0];
		self.model.notifyChange(nodeData);
		nodeData.label = text;
		$node.find("text").html(text)		
		self.computeNodeSize($node[0], nodeData)
	}
	dragNodeStarted(domElt, event, d) {
		var node = this.builder.gotInstance($(domElt), d, this);
		node.positionChanges = false;
		//console.log("dragNodeStarted", domElt, event.x, event.y);
		//d3.event.sourceEvent.stopPropagation();
		//let n = d3.select(d3.event.currentTarget);
		//if (!d3.event.active) graphLayout.alphaTarget(0.3).restart();
		//d.x = 0;
		//d.y = 0;
	}
	draggingNode(domElt, event, d) {
		//console.log("draggingNode", domElt, event.x, event.y);
		var self = this;
		d.x = event.x;
		d.y = event.y;
		d3.select(domElt).attr('transform','translate('+d.x + "," + d.y+')');
		var node = self.builder.gotInstance($(domElt), d, self);
		node.positionChanges = true;
		$.each(node.inputs, function(index, link) {
			var src = link.sourceNode;
			var dst = link.targetNode;
			link = d3.select(link.domElt[0]);
			self.setLinkPosition(link, src, dst);
		});				
		/*$.each(d.inputs, function(index, link) {
			var src = link.data()[0].sourceNode;
			var dst = link.data()[0].targetNode;
			self.setLinkPosition(link, src, dst);
		});*/
		$.each(node.outputs, function(index, link) {
			var src = link.sourceNode;
			var dst = link.targetNode;
			link = d3.select(link.domElt[0]);
			self.setLinkPosition(link, src, dst);
		});
		/*$.each(d.outputs, function(index, link) {
			var src = link.data()[0].sourceNode;
			var dst = link.data()[0].targetNode;
			self.setLinkPosition(link, src, dst);
		});*/
	}
	dragNodeEnded(domElt, event, data) {
		//console.log("dragNodeEnded", domElt, event.x, event.y);
		var node = this.builder.gotInstance($(domElt), data, this);
		if (node.positionChanges)
		//var data = d3.select(domElt).data()[0];
			this.model.notifyChange(data);
		//if (!d3.event.active) graphLayout.alphaTarget(0);
		//d.x = null;
		//d.y = null;
	}
	// domElt : circle.rightSelector
	dragLinkStarted(domElt, event, d) {
		console.log("dragLinkStarted", domElt, event.x, event.y);
		var self = this;
		var elt = d3.select(domElt);
		self.linkCreation.source = elt;
		elt.style("cursor", "pointer").transition().attr("fill-opacity", "0.5").duration(300);
		var d3Node = d3.select(domElt.parentElement);
		var rectData = self.getNodeRectData(d3Node);
		//var posL = self.getLeftAnchorPosition(node)
		//var posR = self.getRightAnchorPosition(node);		
		var posR = {
			x: rectData.x + rectData.width / 2,
			y: rectData.y + rectData.height / 2
		};
		
		var data = d3Node.data()[0];
		
		var diff = {
			x : posR.x - event.x,
			y : posR.y - event.y
		};
		self.createDndLink(self.container, posR, diff);
	}
	createDndLink(container, origin, diff) {
		var self = this;
		console.log("create fake link");
		self.fakeLink = container.append("line");
		console.log(self.fakeLink);
		self.fakeLink
			.attr("x1", origin.x)			
			.attr("y1", origin.y)
			.attr("x2", origin.x)
			.attr("y2", origin.y)
			.attr("stroke", "#000000")
			.attr("stroke-width", "1px");
		self.fakeLink.diff = diff;
	}
	draggingLink(domElt, event, d) {
		//console.log("draggingLink", domElt, event.x, event.y);
		var self = this;
		self.fakeLink.attr("x2", event.x + self.fakeLink.diff.x).attr("y2", event.y + self.fakeLink.diff.y);
	}
	dragLinkEnded(domElt, event, d) {
		console.log("dragLinkEnded", domElt, event.x, event.y);
		var self = this;
		self.fakeLink.remove();
		if (self.linkCreation.target != null) {			
			var newLink = self.builder.createLink(self.linkCreation.source, self.linkCreation.target);
			this.data.links.push(newLink);
			this.updateGraph();
		}
		self.linkCreation.source.style("cursor", "default").transition().attr("fill-opacity", "0").duration(300);
		self.linkCreation.source = null;
		if (self.linkCreation.target != null) {
			self.linkCreation.target.style("cursor", "default").transition().attr("fill-opacity", "0").duration(300);
			self.linkCreation.target = null;
		}
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
		/*
		else if ($elt.hasClass("node")) {
			//console.log("node");
		}
		*/
	}
}