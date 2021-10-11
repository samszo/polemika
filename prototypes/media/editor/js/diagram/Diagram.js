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
							if (!d3Node.classed("selectedElement") && collision)
								d3Node.classed("selectedElement", true);
							else if (d3Node.classed("selectedElement") && !collision)
								d3Node.classed("selectedElement", false);
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
						self.setSelection($.map($("g.selectedElement", this.node), function(obj) { return obj; }));
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
	/* to be overridden */
	updateGraph() {}

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
	deleteNode(node) {
		var index = this.data.nodes.indexOf(node.data);
		if (index > -1)
			this.data.nodes.splice(index, 1);
	}
	deleteLink(link) {
		var index = this.data.links.indexOf(link.data);
		if (index > -1)
			this.data.links.splice(index, 1);
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
				$(obj).addClass("selectedElement");
			});
			$.each(_.filter(self.selection, function(obj){ return !_.findWhere(selection, obj); }), function(index, obj) {
				$(obj).removeClass("selectedElement");
			});
			this.selection = selection;
			this.notifyObservers({ name : "selectionChanged" });
		}
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
}