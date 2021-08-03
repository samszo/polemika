class Diagram {

    constructor(params) {
		var self = this;
        self.editor = params.editor;
		//self.cont = d3.select("#"+params.idCont);
		self.cont = d3.select(params.container[0]);
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
		self.selection = null;		

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
				self.clickOn(this, event, data);
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
		self.svg.call(
			d3.zoom()
				.scaleExtent([.1, 4])
				.on("zoom", function(event) {
					self.currentTransform = event.transform;
					self.container.attr("transform", event.transform);
				})		
		);
		self.nodesData = self.container.append("g").attr("class", "nodes");
		self.linksData = self.container.append("g").attr("class", "links");
	}
	updateGraph() {
		var self = this;
		//construction des noeuds
		self.node = self.nodesData
			.selectAll("g")
			.data(self.data.nodes)
			.enter()
			.append("g")
			.attr("class", "node")
			.attr("id", d => "gNode"+d.id)
			.attr("transform",d=>"translate("+d.x+","+d.y+")")
			.on("mouseover", function(d) {
				self.focus(this, d);
			}).on("mouseout", function(d) {
				self.unfocus(this, d);
//			}).on('click', function(event, data) {
//				self.clickOn(this, event, data);
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
		
		self.linksLayers = self.node.append("rect")
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
		self.rectNode = self.node.append("rect")
			.attr("class", "rectNode")
			.attr("id", d=>"rectNode"+d.id)
			.attr("fill", "white")
			.attr('stroke',d=>{
				let s = "rgba("+self.styles[0]["concept-style"]["border-color"]+")";
				if(d.style) s = d.style['border-color'] ? "rgba("+d.style['border-color']+")" : s;
				if(d.type=="linking-phrase")s = "none";
				return s  
			})
			.attr('stroke-width',self.styles[0]["concept-style"]["border-thickness"])                    
			.attr('fill',d=>{
				let s = "rgba("+self.styles[0]["concept-style"]["background-color"]+")";
				if(d.style) s = d.style['color'] ? d.style['color'] : s;
				if(d.type=="linking-phrase")s = "white";
				return s
			}).on('click', function(event, data) {
				self.clickOn(this, event, data);
			});
			//.style("pointer-events", "none"); // to prevent mouseover/drag capture

		//construction des labels
		self.labelNode = self.node.append('text')
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
		self.node.each(function(d,i){
			//récupère la taille du texte
			let dNode = d3.select(this);
			let dLinkLayer = d3.select("#linksLayer"+d.id);
			let dText = d3.select("#labelNode"+d.id);
			let dRect = d3.select("#rectNode"+d.id);
			let bb = dText.node().getBBox();
			let marge = parseInt(self.styles[0]["concept-style"]["text-margin"]);

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
		});
		
		//construction des liens
		self.link = self.linksData
			.selectAll("line")
			.data(self.data.links)
			.join("line")
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
				self.clickOn(this, event, data);
			});
		// set links data to node
		self.link.each(function(d,i) {
			let src = d3.select("#gNode"+d.src);
			let dst = d3.select("#gNode"+d.dst);
			var link = d3.select(this);
			d.sourceNode = src;
			d.targetNode = dst;
			var dstData = dst.data()[0]
			var inputs = dstData.inputs;
			if (inputs == null) {
				inputs = [];
				dstData.inputs = inputs;
			}			
			inputs.push(link);
			var srcData = src.data()[0];
			var outputs = srcData.outputs;
			if (outputs == null) {
				outputs = [];
				srcData.outputs = outputs;
			}
			outputs.push(link);
		});
		// init connectors
		/*
		self.rightConnectors.each(function(d,i) {
				var connector = d3.select(this);			
				var width = self.getWidth(d3.select(this.parentNode));
				connector.attr("cx", width-10);
			});
		*/
		//redimensionne les liens
		self.link.each(function(d,i){
			//récupère la source et la destination
			let src = d3.select("#gNode"+d.src);
			let dst = d3.select("#gNode"+d.dst);
			self.setLinkPosition(d3.select(this), src, dst);
		});

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
	addNode(node, pos) {
		var self = this;
		if (self.currentTransform) {
			pos.x = pos.x - self.currentTransform.x;
			pos.y = pos.y - self.currentTransform.y;
			pos.x = pos.x / self.currentTransform.k;
			pos.y = pos.y / self.currentTransform.k;			
		}
		self.model.setNodePosition(node, pos);
		self.data.nodes.push(node);
		this.updateGraph();
		//var oneNodeData = self.data.nodes[1];
		//oneNodeData.x = 100;
		//oneNodeData.y = 100;
		
		//self.node.attr("transform",d=>"translate("+d.x+","+d.y+")");		
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
	clickOn(domElt, event, data) {
		console.log("clickOn", domElt);
		if (domElt.tagName != "svg")
			event.stopPropagation(); // if a rectNode is clicked, stop progation to not take into account container click event (we don't want to deselect just after)
		var $elt = $(domElt);
		if (this.linkCreation.source == null)
			this.changeSelection($elt, true, event, data);
		/*
		if ($elt.hasClass("node")) {
			console.log("deactivated showPopup");
			//this.showPopup($elt);
		}
		*/
	}
	changeSelection($elt, selection, event, data) {
		var self = this;
		if (self.selection != null && ($elt.hasClass("rectNode") || $elt.hasClass("link") || $elt.hasClass("svg")))
			self.setSelectionMode(self.selection, false);
		if ($elt.hasClass("svg")) {
			//self.hidePopup();
			self.editor.hideActions();
			self.selection = null;
		} else if ($elt.hasClass("rectNode") || $elt.hasClass("link")) {
			self.setSelectionMode($elt, selection);
			self.selection = $elt;
			//self.showPopup(parseFloat(data.x), parseFloat(data.y) + $elt.outerHeight());
			self.updatePopupActions($elt, data);
			self.editor.showActions(event);
		} else
			self.selection = null;
		self.editor.selectionChange(self.selection);
	}
	changeText($elt, text) {
		var self = this;
		var d = d3.select($elt[0]).data()[0];
		d.label = text;
		//d3.select($elt[0]).attr("fill", "red");
		$elt.parent().find("text").html(text)
		//this.updateGraph();
	
		let bb = d3.select("#labelNode"+d.id).node().getBBox();
		let marge = parseInt(self.styles[0]["concept-style"]["text-margin"]);                    
		d3.select($elt[0])
			.attr('x',-marge)
			.attr('y',-marge-self.styles[0]["concept-style"]["font-size"])                    
			.attr('width',bb.width+(marge*2))
			.attr('height',bb.height+(marge*2));		
	}
	setSelectionMode($elt, selection) {
		var self = this;
		if ($elt.hasClass("rectNode")) {
			var dElt = d3.select($elt[0]);
			if (!selection)
				dElt.attr('stroke-width',self.styles[0]["concept-style"]["border-thickness"]);
			else
				dElt.attr('stroke-width', "2px");
		} else if ($elt.hasClass("link")) {
			var dElt = d3.select($elt[0]);
			if (!selection) {
				var data = dElt.data();
				let s = self.styles[0]["connection-style"]["thickness"]+"px";
				if (data.style)
					s = data.style['thickness'] ? data.style['thickness'] : s;
				dElt.attr('stroke-width', s);
			} else
				d3.select($elt[0]).attr('stroke-width', "2px");
		}
	}
	dragNodeStarted(domElt, event, d) {
		console.log("dragNodeStarted", domElt, event.x, event.y);
		//d3.event.sourceEvent.stopPropagation();
		//let n = d3.select(d3.event.currentTarget);
		//if (!d3.event.active) graphLayout.alphaTarget(0.3).restart();
		//d.x = 0;
		//d.y = 0;
	}
	draggingNode(domElt, event, d) {
		console.log("draggingNode", domElt, event.x, event.y);
		var self = this;
		d.x = event.x;
		d.y = event.y;
		d3.select(domElt).attr('transform','translate('+d.x + "," + d.y+')');
		$.each(d.inputs, function(index, link) {
			var src = link.data()[0].sourceNode;
			var dst = link.data()[0].targetNode;
			self.setLinkPosition(link, src, dst);
		});
		$.each(d.outputs, function(index, link) {
			var src = link.data()[0].sourceNode;
			var dst = link.data()[0].targetNode;
			self.setLinkPosition(link, src, dst);
		});
	}
	dragNodeEnded(domElt, event, d) {
		console.log("dragNodeEnded", domElt, event.x, event.y);
		var data = d3.select(domElt).data()[0];
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
			self.createLink(self.linkCreation.source, self.linkCreation.target);
		}
		self.linkCreation.source.style("cursor", "default").transition().attr("fill-opacity", "0").duration(300);
		self.linkCreation.source = null;
		if (self.linkCreation.target != null) {
			self.linkCreation.target.style("cursor", "default").transition().attr("fill-opacity", "0").duration(300);
			self.linkCreation.target = null;
		}
	}
	createLink(sourceNode, targetNode) {
		var link = {
			"label":"",
			"id":-1,
			"src":sourceNode.data()[0].id,
			"dst":targetNode.data()[0].id,
			"urlAdmin":"",
			"style":{
				"from-pos":"center",
				"to-pos":"center",
				"arrowhead":"yes",
				"color":"#000000",
				"lineStyle":"solid"
			}
		};
		this.data.links.push(link);
		this.updateGraph();
	}
	showTooltip(event, data){
		console.log("show tooltip", event, data);
	}
	
	focus(domElt, data) {
		var self = this;
		var $elt = $(domElt);
		if ($elt.hasClass("linksLayer")) {			
			if (self.linkCreation.source == null) {
				console.log("focus linksLayer");
				d3.select(domElt).style("cursor", "pointer").transition().attr("fill-opacity", "0.5").duration(200);
			} else {
				console.log("SET TARGET")
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
				console.log("focus linksLayer");
				d3.select(domElt).style("cursor", "default").transition().attr("fill-opacity", "0").duration(200);
			} else {				
				var elt = d3.select(domElt);
				console.log("elt", elt);
				console.log("self.linkCreation.source", self.linkCreation.source);
				if (self.linkCreation.source != elt) {
					elt.style("cursor", "default").transition().attr("fill-opacity", "0").duration(200);
					self.linkCreation.target = null;
					console.log("set target null");
				}
			}
		}
		/*
		else if ($elt.hasClass("node")) {
			//console.log("node");
		}
		*/
	}
	getActions(domElt, data) {
		var self = this;
		return {
			"supprimer" : function($rectNode) {
				console.log("supprimer", d3Node);
				var d3Node = d3.select($rectNode.parent()[0]);
				self.deleteNode(d3Node, true);
			},
			"autre" : function(d3Node) {
				console.log("autre action", d3Node);
			}
		};
	}
	updatePopupActions(domElt, data) {
		console.log("UPDATE POPUP");
		var self = this;
		var $popup = self.editor.gotPopup();
		$popup.attr('width', 300);
		var width = 0;
		var height = 0;		
		var updateActions = self.getActions(domElt, data);
		$popup.empty();
		$.each(updateActions, function(actionName, func) {
			var $div = $('<div class="editor-popup-action"></div>');
			$div.addClass("action");
			$div.html(actionName);
			$popup.append($div);
			var dim = $div[0].getBoundingClientRect();
			width = Math.max(width, dim.width);
			height += $div.outerHeight();			
			$div.bind("click", function(event) {
				event.stopPropagation();
				updateActions[actionName](self.selection);
				self.editor.hideActions();
			});
		});
		$popup.attr('width', width);
		$popup.attr('height', height+2);
	}
}