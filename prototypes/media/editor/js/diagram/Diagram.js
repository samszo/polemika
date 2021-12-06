class Diagram extends PSubject {

    constructor(params) {
		super();
		var self = this;
        self.editor = params.editor;
        self.diagramData = params.diagramData;
		self.builder = this.createBuilder();
		self.creationPanel = self.editor.creationPanelContainer.createCreationPanel(self, params.archetypes);
		self.node = params.container;
		params.container.data("object", this);
		self.cont = d3.select(params.container[0]);
		self.editionMode = null;
		self.ongoingSelection = false;
		self.finalizeSelection = false;
        self.kId = params.kId ? params.kId : 'o:id'; //identifiant omeka S
        self.kName = params.kName ? params.kName : 'o:title'; //title omeka S
		self.color = d3.scaleOrdinal(d3.schemeCategory10);
		self.textMargin = 4; //parseInt(self.styles[0]["concept-style"]["text-margin"]);
		self.selection = [];
    }
	getName() {
	    return this.diagramData.name;
	}
	setName(newName, callback) {
	    var self = this;
	    this.editor.api.changeDiagramName(this.diagramData, newName, function(result) {
	        if (result == true) {
                self.diagramData.name = newName;
                self.editor.menuRoot.find(".carte-selector input").val(newName);
                self.editor.initDiagramChooser();
	        }
	        callback(result);
	    })
	}
	delete(callback) {
	    var self = this;
	    this.editor.api.deleteDiagram(this.diagramData, function() {
	        self.editor.diagrams = _.reject(self.editor.diagrams, self.diagramData);
	        self.editor.initDiagramChooser();
	        self.editor.unloadDiagram(this);
	        callback();
	    })
	}
    load(data) {
		this.data = data;
		this.normalizeData(data);
		this.initGraph();
		this.updateGraph();
    }
    getData() {
        return this.data;
    }
    createMarkers() {
		var self = this;
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
    }
	initGraph() {
		var self = this;
		self.svgWidth = self.cont.node().getBoundingClientRect().width;
		self.svgHeight = self.cont.node().getBoundingClientRect().height;
		self.svg = self.cont.append("svg")
			.attr("class", "svg")
			.attr("width", '100%')
			.attr("height", '100%')
			.attr('viewBox',0+' '+0+' '+self.svgWidth+' '+self.svgHeight)
			.attr('preserveAspectRatio','xMinYMin meet')
			.on('click', function(event, data) {
				//console.log("svg->click");
				if (!self.finalizeSelection) {
					event.preventDefault();
					event.stopPropagation();
					self.setSelection([]);
				} else
					self.finalizeSelection = false;
			})
			.on("contextmenu", function (event, data) {
				//console.log("svg->contextmenu");
				if (!self.ongoingSelection) {
					event.preventDefault();
					event.stopPropagation();
					self.notifyObservers({ name : "openContextualMenu", data: data, event: event });
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
			})
			.on("mousemove", function(event) {
			    //console.log(d3.pointer(event, d3.select("g.container")));
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
							var tX = parseInt(state_data.tlCorner.x);
							var tY = parseInt(state_data.tlCorner.y);
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
		self.createMarkers();
		//création du conteneur
		self.container = self.svg.append("g").attr("class", "container");

		//création du fond
		self.container.append('rect')
			.attr("id", 'svgFond')
			.attr("x", 0).attr("y", 0)
			.attr("width", '100%')
			.attr("height", '100%')
			.attr('fill',"rgba(255,255,255,0)");
			//.attr('fill',"rgba("+self.styles[0]["map-style"]["background-color"]+")");
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
	normalizeData(data) {}
	/* to be overridden */
	updateGraph() {}

	addNode(nodeData, pos) {
		nodeData.x = pos.x;
		nodeData.y = pos.y;
		this.data.nodes.push(nodeData);
		return $("#gNode"+nodeData.id);
	}
	deleteNode(node) {
		var index = this.data.nodes.indexOf(node.data);
		if (index > -1)
			this.data.nodes.splice(index, 1);
	}
	addLink(link) {
		this.data.links.push(link);
	}
	deleteLink(link) {
		var index = this.data.links.indexOf(link.data);
		if (index > -1)
			this.data.links.splice(index, 1);
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
}