class NodeInstance_argument_force extends NodeInstance {

    constructor(domElt, data, archetype, diagram) {
		super(domElt, data, archetype, diagram);
		this.inputs = [];
		this.outputs = [];
    }
	/* overridden */
	getActions() {
		var self = this;
		var actions = {
			"supprimer" : {
				multi: true,
				func: function(selection) {
					$.each(selection, function(index, domElt) {
						var instance = self.diagram.builder.gotInstance($(domElt));
						instance.delete(true);
					});
				}
			},
			"Propriétés" : {
				multi: false,
				func: function(selection) {
					var instance = self.diagram.builder.gotInstance($(selection[0]));
					self.diagram.editor.nodeStyleModal.open(instance);
				}
			},
			"Importer" : {
				multi: false,
				func: function(selection) {
				    self.diagram.editor.api.getDiagramFragment(function(data) {
                        $.each(data.nodes, function(index, nodeData) {
                            var existingNode = _.find(self.diagram.data.nodes, function(elt) {
                                return elt.id == nodeData.id;
                            });
                            if (existingNode == null)
                                self.diagram.data.nodes.push(nodeData);
                        });
                        $.each(data.links, function(index, linkData) {
                            var existingLink = _.find(self.diagram.data.links, function(elt) {
                                return elt.id == linkData.id;
                            });
                            if (existingLink == null)
                                self.diagram.data.links.push(linkData);
                        });
                        self.diagram.updateGraph();
				    });
				}
			}
		};
		if (self.data.cssStyle && self.data.cssStyle.length > 0)
			actions["Réifier"] = {
				multi: false,
				func: function(selection) {
					var instance = self.diagram.builder.gotInstance($(selection[0]));
					self.diagram.editor.reificationModal.open(instance);
				}
			};
		return actions;
	}
	/* overridden */
	renderNodeStyle() {
		var rect = d3.select(this.domElt.find(".rectNode")[0]);
		this.diagram.computeNodeStyle(rect);
	}
	graphEnter(d3Node, data) {
        //console.log("NodeInstance_argument_force> graphEnter");
        var self = this;
        d3Node
			.attr("class", "node")
			.attr("id", d => "gNode"+d.id)
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
		d3Node.append("rect")
			.attr("class", "linksLayer")
			.attr("id", d=>"linksLayer"+d.id)
			.attr("stroke", "rgba(255,150,0,255)")
			.attr("fill-opacity", "0")
			.on("mouseover", function(d) {
				self.linksLayerFocus(this, d);
			}).on("mouseout", function(d) {
				self.linksLayerUnfocus(this, d);
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
		var rect = d3Node.append("rect")
			.attr("class", "rectNode")
			.attr("id", d=>"rectNode"+d.id)
			.attr("fill", "white")
            .on('click', function(event, data) {
				console.log("rect->click");
                event.stopPropagation(); // if a rectNode is clicked, stop progation to not take into account container click event (we don't want to deselect just after)
                if (self.diagram.linkCreation.source == null) {
                    var selection = self.diagram.selection.slice();
                    if (!event.ctrlKey)
                        selection = [];
                    var domElt = $(this).parent()[0];
                    selection.push(domElt);
                    self.diagram.setSelection(selection);
                }
				//self.diagram.clickOn($(this).parent()[0], event, data, true);
			}).on("contextmenu", function (event, data) {
				console.log("rect->contextmenu");
				event.preventDefault();
                event.stopPropagation();
                var domElt = $(this).parent()[0];
                if (!_.contains(this.selection, domElt))
                    self.diagram.setSelection([domElt]);
                self.diagram.notifyObservers({ name : "openContextualMenu", data: data, event: event });
				//self.diagram.clickOn($(this).parent()[0], event, data, false);
			});
		self.computeNodeStyle(rect);
		d3Node.append('text')
			.attr("class", "labelNode")
			.attr("id", d=>"labelNode"+d.id)
			.attr('font-size', 12)
			.attr('font-family', 'Verdana')
			.attr('fill', d=> {
				let s = "rgba(0,0,0,255)"; //let s = "rgba("+self.styles[0]["concept-style"]["font-color"]+")";
				//s = "none";
				if(d.style) s = d.style['fgTextColor'] ? d.style['fgTextColor'] : s;
				return s
			})
			.style("pointer-events", "none") // to prevent mouseover/drag capture
			.html(function(d) {
				return d.label;
			});
		self.computeNodeSize(d3Node, data);
		self.computePosition(d3Node, data);
	}
	graphUpdate(d3Node, data) {
	    //console.log("NodeInstance_argument_force> graphUpdate");
	    if (this.updateSize) {
	        this.updateSize = false;
	        this.computeNodeSize(d3Node, data);
	    }
	    if (this.updatePosition) {
	        this.updatePosition = false;
	        this.computePosition(d3Node, data);
	    }
	}
	graphExit(d3Node, data) {
	    console.log("NodeInstance_argument_force> graphExit");
	    d3Node.remove();
	}
	computePosition(d3Node, data) {
        if (data.x != null && !isNaN(data.x)) {
            data.tlCorner = {
                x: data.x - data.width / 2,
                y: data.y - data.height / 2
            }
            d3Node.attr("transform", "translate("+data.tlCorner.x+","+data.tlCorner.y+")");
        }
	}
	setPosition(x, y) {
	    this.updatePosition = true;
	    this.data.x = x;
	    this.data.y = y;
	    if (!this.inLayoutScope) {
            this.data.fx = x;
            this.data.fy = y;
	    }
	}
	setInLayoutScope(inScope) {
        this.inLayoutScope = inScope;
        if (inScope) {
            delete this.data["fx"];
            delete this.data["fy"];
        } else {
            this.data["fx"] = this.data["x"];
            this.data["fy"] = this.data["y"];
        }
	}
	isInLayoutScope() {
	    return this.inLayoutScope;
	}
	setLabelText(text) {
		var self = this;
		var d3Node = d3.select(this.domElt[0]);
		this.data.label = text;
		this.diagram.model.notifyChange(this.data);
		this.domElt.find("text").html(text)
		this.updateSize = true;
		this.updatePosition = true;
        $.each(this.inputs, function(index, link) {
            link.updatePosition = true;
        });
        $.each(this.outputs, function(index, link) {
            link.updatePosition = true;
        });
		//this.computeNodeSize(d3Node, this.data);
		this.diagram.updateGraph();
	}
	computeNodeStyle(d3Node) {
		var self = this;
		d3Node
            .attr('stroke', function(d) {
                var instance = self.diagram.builder.gotInstance($(this).parent(), d, self);
                var styleTable = instance.getStyleTable();
                var s = styleTable["border-color"];
                if (s == null)
                    s = "rgba(0,0,0,255)";
                return s;
            })
            .attr('stroke-width', function(d) {
                var instance = self.diagram.builder.gotInstance($(this).parent(), d, self);
                var styleTable = instance.getStyleTable();
                var s = styleTable["border-width"];
                if (s == null)
                    s = 1;
                return s;
            })
            .attr('fill', function(d) {
                var instance = self.diagram.builder.gotInstance($(this).parent(), d, self);
                var styleTable = instance.getStyleTable();
                var s = styleTable["background-color"];
                if (s == null)
                    s = "rgba(237,244,246,255)";
                return s
            });
	}
	computeNodeSize(d3Node, data) {
		//récupère la taille du texte
		let dLinkLayer = d3.select("#linksLayer"+data.id);
		let dText = d3.select("#labelNode"+data.id);
		let dRect = d3.select("#rectNode"+data.id);
		let bb = dText.node().getBBox();
		let marge = 4; //let marge = parseInt(this.styles[0]["concept-style"]["text-margin"]);

		let layerBorderMargin = 10;
		let textBorderMargin = 2;

		let textWidth = bb.width+(marge*2);
		let textHeight = bb.height+(marge*2);
		let rectWidth = textWidth + textBorderMargin*2;
		let rectHeight = textHeight + textBorderMargin*2;
		data.width = rectWidth + layerBorderMargin*2;
		data.height = rectHeight + layerBorderMargin*2;
		//let textX = -marge;
		//let textY = -marge-self.styles[0]["concept-style"]["font-size"];
		dLinkLayer
			//.attr('cx',0)
			//.attr('cy',0)
			//.attr('fill','transparent')
			.attr('width', data.width)
			.attr('height', data.height);
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
	}
	linksLayerFocus(domElt, data) {
		var self = this;
		var $elt = $(domElt);
		var d3Node = d3.select(domElt);
		if ($elt.hasClass("linksLayer")) {
			if (self.diagram.linkCreation.source == null) {
				d3Node.style("cursor", "pointer").transition().attr("fill-opacity", "0.5").duration(200);
			} else {
				self.diagram.linkCreation.target = d3Node;
				d3Node.style("cursor", "pointer").transition().attr("fill-opacity", "0.5").duration(300);
			}
		}
		else if ($elt.hasClass("node")) {
			//console.log("node");
		}
	}
	linksLayerUnfocus(domElt, data) {
		var self = this;
		var $elt = $(domElt);
		if ($elt.hasClass("linksLayer")) {
			if (self.diagram.linkCreation.source == null) {
				d3.select(domElt).style("cursor", "default").transition().attr("fill-opacity", "0").duration(200);
			} else {
				var elt = d3.select(domElt);
				if (self.diagram.linkCreation.source != elt) {
					elt.style("cursor", "default").transition().attr("fill-opacity", "0").duration(200);
					self.diagram.linkCreation.target = null;
				}
			}
		}
	}
	dragLinkStarted(domElt, event, d) {
		console.log("dragLinkStarted", domElt, event.x, event.y);
		var self = this;
		var elt = d3.select(domElt);
		self.diagram.linkCreation.source = elt;
		elt.style("cursor", "pointer").transition().attr("fill-opacity", "0.5").duration(300);
		var d3Node = d3.select(domElt.parentElement);
		var data = d3Node.data()[0];
		var origin = {
			x: data.x + data.width / 2,
			y: data.y + data.height / 2
		};
		var diff = {
			x : origin.x - event.x,
			y : origin.y - event.y
		};
		var container = self.diagram.container;
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
		var self = this;
		self.fakeLink.attr("x2", event.x + self.fakeLink.diff.x).attr("y2", event.y + self.fakeLink.diff.y);
	}
	dragLinkEnded(domElt, event, d) {
		console.log("dragLinkEnded", domElt, event.x, event.y);
		var self = this;
		self.fakeLink.remove();
		if (self.diagram.linkCreation.target != null) {
			var newLink = self.diagram.builder.createLink(self.diagram.linkCreation.source, self.diagram.linkCreation.target);
			this.diagram.addLink(newLink);
		}
		self.diagram.linkCreation.source.style("cursor", "default").transition().attr("fill-opacity", "0").duration(300);
		self.diagram.linkCreation.source = null;
		if (self.diagram.linkCreation.target != null) {
			self.diagram.linkCreation.target.style("cursor", "default").transition().attr("fill-opacity", "0").duration(300);
			self.diagram.linkCreation.target = null;
		}
	}
	dragNodeStarted(domElt, event, d) {
		console.log("event", event.x, event.y);
		this.diagram.stopAutoLayout();
		this.draggedNodeElts = this.diagram.selection.slice();
		this.draggedNodeElts = _.filter(this.draggedNodeElts, function(elt) {return $(elt).hasClass("node")});
		if (this.draggedNodeElts.indexOf(domElt) < 0)
		    this.draggedNodeElts.push(domElt);
		this.dragChangePosition = false;
	}
	draggingNode(domElt, event, data) {
		//console.log("draggingNode", domElt, event.x, event.y);
		var self = this;
		this.dragChangePosition = true;
		var diff = {
		    x: event.x - data.x,
		    y: event.y - data.y
		}
		$.each(this.draggedNodeElts, function(index, domElt) {
            var d3Node = d3.select(domElt);
            var node = self.diagram.builder.gotInstance($(domElt));
            //node.setInLayoutScope(false);
            node.setPosition(node.data.x + diff.x, node.data.y + diff.y);
            $.each(node.inputs, function(index, link) {
                link.updatePosition = true;
            });
            $.each(node.outputs, function(index, link) {
                link.updatePosition = true;
            });
		});
		this.diagram.updateGraph();
	}
	dragNodeEnded(domElt, event, data) {
		//console.log("dragNodeEnded", domElt, event.x, event.y);
		var self = this;
		if (this.dragChangePosition) {
            $.each(this.draggedNodeElts, function(index, domElt) {
            	var node = self.diagram.builder.gotInstance($(domElt));
            	self.diagram.model.notifyChange(node.data);
            });
		}
	}
}