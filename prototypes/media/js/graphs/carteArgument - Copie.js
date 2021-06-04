class carteArgument {
    constructor(params, $button) {
        var self = this;
        self.cont = d3.select("#"+params.idCont);
        self.width = params.width ? params.width : 600;
        self.height = params.height ? params.height : 600;
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

		//construction du svg
		self.svg = self.cont.append("svg")
			.attr("width", self.width+'px')
			.attr("height", self.height+'px')
			.attr('viewBox',0+' '+0+' '+self.data.w+' '+self.data.h)
			.attr('preserveAspectRatio','xMinYMin meet');
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
		self.container = self.svg.append("g");
		//création du fond
		self.container.append('rect')
			.attr("id", 'svgFond')
			.attr("x", 0).attr("y", 0)
			.attr("width", self.width+'px')
			.attr("height", self.height+'px')
			.attr('fill',"rgba("+self.styles[0]["map-style"]["background-color"]+")");
		// définition du zoom
		self.svg.call(
			d3.zoom()
				.scaleExtent([.1, 4])
				.on("zoom", function(event) {
					self.container.attr("transform", event.transform);
				})		
		);
		// bind external actions		
		$button.bind("click", function() {
			self.createNode();
		});
		self.initGraph();
    }
	initGraph() {
		var self = this;
		//construction des noeuds
		self.node = self.container.append("g")
			.attr("class", "nodes")
			.selectAll("g")
			.data(self.data.nodes)
			.join("g")
			.attr("class", "node")
			.attr("id", d => "gNode"+d.id)
			.attr("transform",d=>"translate("+d.x+","+d.y+")")
			.on("mouseover", function(d) {
				self.focus(this, d);
			}).on("mouseout", function(d) {
				self.unfocus(this, d);
			}).style("cursor", "pointer")
			.call(
				d3.drag()
					.on("start", function(event, d) {
						self.dragStarted(this, event, d);
					}).on("drag", function(event, d) {
						self.dragging(this, event, d);
					}).on("end", function(event, d) {
						self.dragEnded(this, event, d);
					})
			);
		//construction des connecteurs
		self.rightConnectors = self.node.append("circle")
			.attr("class", "rightConnector")
			.attr("cy", "-5")
			.attr("r", "10")
			.attr("fill-opacity", "0")
			.style("cursor", "default")
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
		self.leftConnectors = self.node.append("circle")
			.attr("class", "leftConnector")
			.attr("cx", "-5")
			.attr("cy", "-5")
			.attr("r", "10")
			.attr("fill-opacity", "0")
			.style("cursor", "default")
			.on("mouseover", function(d) {
				self.focus(this, d);
			}).on("mouseout", function(d) {
				self.unfocus(this, d);
			}).call(
				d3.drag()
					.on("start", function(event, d) {						
					}).on("drag", function(event, d) {						
					}).on("end", function(event, d) {						
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
				if(d.type=="linking-phrase")s = "none";
				return s
			}).on('click', function(data) {
				self.clickOn(this, data);
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
			.html(d=>d.label);
			//.style("pointer-events", "none"); // to prevent mouseover/drag capture
		

		//redimensionne les enveloppes
		self.rectNode.each(function(d,i){
			//récupère la taille du texte
			let bb = d3.select("#labelNode"+d.id).node().getBBox();
			let marge = parseInt(self.styles[0]["concept-style"]["text-margin"]);                    
			d3.select(this)
				.attr('x',-marge)
				.attr('y',-marge-self.styles[0]["concept-style"]["font-size"])                    
				.attr('width',bb.width+(marge*2))
				.attr('height',bb.height+(marge*2));                    
		});
		
		//construction des liens
		self.link = self.container.append("g").attr("class", "links")
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
			}).on('click', function(data) {
				self.clickOn(this, data);
			});
		//redimensionne les liens
		self.link.each(function(d,i){
			//récupère la source et la destination
			let src = d3.select("#gNode"+d.src);
			let dst = d3.select("#gNode"+d.dst);
			self.setLinkPosition(d3.select(this), src, dst);
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
		self.rightConnectors.each(function(d,i) {
				var connector = d3.select(this);			
				var width = self.getWidth(d3.select(this.parentNode));
				connector.attr("cx", width-10);
			});
	}
	setLinkPosition(link, src, dst) {
		var self = this;
		var targetPoint = self.getLeftAnchorPosition(dst);
		var sourcePoint = self.getRightAnchorPosition(src);
		link.attr('x1',sourcePoint.x)
			.attr('y1',sourcePoint.y)
			.attr('x2',targetPoint.x)
			.attr('y2',targetPoint.y);
	}
	getLeftAnchorPosition(d3Node) {
		var data = d3Node.data()[0];
		var box = d3Node.node().getBBox();
		return {
			x: parseInt(data.x)-this.textMargin, 
			y: parseInt(data.y)-(box.height/2)
		};
	}
	getRightAnchorPosition(d3Node) {
		var data = d3Node.data()[0];
		var box = d3Node.node().getBBox();
		return {
			x: box.width+parseInt(data.x)-this.textMargin,
			y: parseInt(data.y)-(box.height/2)
		};
	}
	getWidth(d3Node) {
		var box = d3Node.node().getBBox();
		return box.width-this.textMargin;
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
		this.initGraph();
	}
	createNode() {
		console.log("createNode");
		var self = this;
		/*var newNode = {
			label:"Mon label",
			id:520,
			idConcept:76146,
			x:"0",
			y:"0",
			type:"concept",
			urlAdmin:"/polemika/omk/admin/item/76146/edit",
			style:{"border-color":"255,150,0,255","color":"#EDF4F6","fgTextColor":"#000000"}
		};
		self.data.nodes.push(newNode);*/
		var oneNodeData = self.data.nodes[1];
		oneNodeData.x = 100;
		oneNodeData.y = 100;
		
		//self.node.attr("transform",d=>"translate("+d.x+","+d.y+")");		
	}
	deleteNode() {
		console.log("deleteNode");
	}
	deleteLink() {
		console.log("deleteLink");
	}
	clickOn(domElt, data) {
		if (this.selection != null)
			this.setSelectionMode(this.selection, false);
		this.selection = domElt;
		this.setSelectionMode(domElt, true);		
	}
	setSelectionMode(domElt, selection) {
		var self = this;
		var $elt = $(domElt);
		if ($elt.hasClass("rectNode")) {
			if (!selection)
				d3.select(domElt).attr('stroke-width',self.styles[0]["concept-style"]["border-thickness"]);
			else
				d3.select(domElt).attr('stroke-width', "2px");
		} else if ($elt.hasClass("link")) {
			var dElt = d3.select(domElt);
			if (!selection) {
				var data = dElt.data();
				let s = self.styles[0]["connection-style"]["thickness"]+"px";
				if (data.style)
					s = data.style['thickness'] ? data.style['thickness'] : s;
				dElt.attr('stroke-width', s);
			} else
				d3.select(domElt).attr('stroke-width', "2px");
		}
	}
	dragStarted(domElt, event, d) {
		//d3.event.sourceEvent.stopPropagation();
		//let n = d3.select(d3.event.currentTarget);
		//if (!d3.event.active) graphLayout.alphaTarget(0.3).restart();
		//d.x = 0;
		//d.y = 0;
	}
	dragging(domElt, event, d) {
		//console.log("dragging", event.x, event.y);
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
	dragEnded(domElt, event, d) {
		//if (!d3.event.active) graphLayout.alphaTarget(0);
		//d.x = null;
		//d.y = null;
	}
	dragLinkStarted(domElt, event, d) {
		console.log("dragLinkStarted", event.x, event.y);
		var self = this;
		var elt = d3.select(domElt);
		self.linkCreation.source = elt;
		elt.style("cursor", "pointer").transition().attr("fill-opacity", "0.5").duration(300);		
	}
	draggingLink(domElt, event, d) {
		console.log("draggingLink", event.x, event.y);
	}
	dragLinkEnded(domElt, event, d) {
		console.log("dragLinkEnded", event.x, event.y);
		var self = this;
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
	showTooltip(event, data){
		console.log("show tooltip", event, data);
	}
	focus(domElt, data) {
		var self = this;
		var $elt = $(domElt);
		if ($elt.hasClass("leftConnector")) {
			console.log("leftConnector");
			if (self.linkCreation.source != null) {
				var elt = d3.select(domElt);
				self.linkCreation.target = elt;
				elt.style("cursor", "pointer").transition().attr("fill-opacity", "0.5").duration(300);
			}
		} else if ($elt.hasClass("rightConnector")) {
			console.log("rightConnector");
			if (self.linkCreation.source == null) {
				d3.select(domElt).style("cursor", "pointer").transition().attr("fill-opacity", "0.5").duration(300);
			}			
		} else if ($elt.hasClass("node")) {
			console.log("node");
		}
	}
	unfocus(domElt, data) {
		var self = this;
		var $elt = $(domElt);
		if ($elt.hasClass("leftConnector")) {
			console.log("leftConnector");
			self.linkCreation.target = null;
			d3.select(domElt).style("cursor", "default").transition().attr("fill-opacity", "0").duration(300);
		} else if ($elt.hasClass("rightConnector")) {
			console.log("rightConnector");
			if (self.linkCreation.source == null) {
				d3.select(domElt).style("cursor", "default").transition().attr("fill-opacity", "0").duration(300);
			}
		} else if ($elt.hasClass("node")) {
			console.log("node");
		}
	}
}