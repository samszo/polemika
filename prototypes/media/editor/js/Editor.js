class Editor {

    constructor($node, api, options) {
		var self = this;
		this.node = $node;
		this.api = api;
		this.menuRoot = $(".polemika-editor-menu", $node);
		this.carteContainer = $(".polemika-editor-instance-container", $node);
		this.creationPanelContainer = new CreationPanelContainer($(".panel-adder", $node));
		this.carte = null;
		this.options = options
		var defaultOptions = {
			layout: "full"
		};
		this.options = $.extend(defaultOptions, options);		
		this.layout = new EditorLayout(this.carteContainer, this.options.layout);
		this.currentDiagram = null;
		this.bindSelectionMode();
		this.carteTranslation = {
			x : 13,
			y : -230,
			k : 1.48
		}
		this.initMenu();
		//var style = "background-color: rgb(237, 244, 246); color: black; border-width: 1px; border-color: rgb(255, 150, 0); font-weight: bolder; font-style: italic;";
		this.nodeStyleModal = new NodeStyleModal("nodeStyleModal");
		this.reificationModal = new ReificationModal("reificationModal");
		//this.nodeStyleModal.open();
		
		var $button = $("button[action=test]");
		$button.bind("click", function() {
			var changes = self.getCurrentDiagram().model.getChanges();
			console.log(JSON.stringify(changes, null, 2));
			/*
			var diag = self.getCurrentDiagram();
			
			var svg = d3.select("svg");
			var width = 1836; //svg.attr("width");
			var height = 602; //svg.attr("height");
			$.each(diag.data.links, function(index, link) {
				link.source = link.src;
				link.target = link.dst;
			});
			var node = diag.nodesData;
			var link = diag.linksData;
			var simulation = d3
				.forceSimulation(diag.data.nodes)
				.force("link", d3.forceLink(diag.data.links).id(function(d) { return d.id; }))
				.force("charge", d3.forceManyBody().strength(-30))
				.force("center", d3.forceCenter(800/2, 600/2))
				.on("tick", function() {
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
						.attr("x", function(d) {
							return d.x;
						})
						.attr("y", function(d) {
							return d.y;
						});
				})
				.on("end", function() {
					console.log("END SIMULATION");
					diag.updateGraph();
				});
				
			/*console.log(diag);
			var force = d3.layout.force()
				.size([800, 600])
				.nodes(diag.data.nodes)
				.links(diag.data.links);
			
				force.on('end', function() {
					console.log("END FORCE");
					// When this function executes, the force layout
					// calculations have concluded. The layout will
					// have set various properties in our nodes and
					// links objects that we can use to position them
					// within the SVG container.

					// First let's reposition the nodes. As the force
					// layout runs it updates the `x` and `y` properties
					// that define where the node should be centered.
					// To move the node, we set the appropriate SVG
					// attributes to their new values. We also have to
					// give the node a non-zero radius so that it's visible
					// in the container.

					node.attr('cx', function(d) { return d.x; })
						.attr('cy', function(d) { return d.y; });

					// We also need to update positions of the links.
					// For those elements, the force layout sets the
					// `source` and `target` properties, specifying
					// `x` and `y` values in each case.

					link.attr('x1', function(d) { return d.source.x; })
						.attr('y1', function(d) { return d.source.y; })
						.attr('x2', function(d) { return d.target.x; })
						.attr('y2', function(d) { return d.target.y; });

				});

				// Okay, everything is set up now so it's time to turn
				// things over to the force layout. Here we go.

				force.start();	
			*/
		});
    }
	bindSelectionMode() {
		var self = this;
		this.majDown = false;
		var listener = function(event) {
			if (event.keyCode == 16 && !self.majDown) {
				self.majDown = true;
				self.carteContainer.off("keydown");
				console.log("switchToSelectionMode", true);
				self.getCurrentDiagram().switchToEditionMode("selection");
			}			
		};
		this.carteContainer.on("keydown", listener);
		this.carteContainer.on("keyup", function (event) {
			if (event.keyCode == 16 && self.majDown) {
				self.majDown = false;
				console.log("switchToSelectionMode", false);
				self.getCurrentDiagram().switchToEditionMode("zoom");
				self.carteContainer.on("keydown", listener);
			}
		});		
	}
	getCurrentDiagram() {
		//return this.layout.getSelectedPanel();
		return this.currentDiagram;
	}
	manageEvent(event, subject) {
		//console.log("manageEvent", event, subject);
		var diagram = this.getCurrentDiagram();
		if (subject == diagram) {
			var selection = diagram.getSelection();
			if (event.name == "selectionChanged") {				
				if (selection.length == 1) {
					//console.log("manageEvent", 1);
					var $selection = $(selection[0]);
					if ($selection.hasClass("node"))
						this.enableTextEditor($selection.find(".labelNode").text().trim());
					else
						this.disableTextEditor();
				} else {
					//console.log("manageEvent", 2);
					this.disableTextEditor();
				}
				this.contextualMenu.close();				
			} else if (event.name == "openContextualMenu") {
				this.contextualMenu.open(diagram, event.event);
			}
		} else if (subject == this.editionPanel) {
			//console.log("manageEvent", 3);
			if (event.name == "focusOut") {
				var selection = diagram.getSelection();
				if (selection.length == 1) {
					var $selection = $(selection[0]);
					var value = this.editionPanel.getValue();
					if (value != this.oldValue)
						diagram.changeNodeLabel($selection, value);
				}
			}
		}
	}
	getObject($elt) {
		return $elt.data("object");
	}
	initMenu() {
		var self = this;		
		this.contextualMenu = new ContextualMenu(this.menuRoot.find(".nodeArchetypes"), this);
		// bind external actions		
		this.menuRoot.find(".carte-layout-selector").bind("change", function() {
			var layout = $(this).val();
			self.layout.changeMode(layout);
			console.log("layout", layout);
		});
		this.menuRoot.find(".carte-layout-selector").val(self.options.layout);
		// init carte selector
		if (this.options.diagrams) {
			var diagramNames = _.map(this.options.diagrams, function(obj){ return obj.name; });
			this.menuRoot.find(".carte-selector input").autocomplete({
				source: diagramNames,
				select: function(event, ui) {					
					var diagramName = ui.item.label;
					var diagram = _.find(self.options.diagrams, function(obj){ return obj.name == diagramName; });
					self.loadDiagram(diagram);
				}
			});
		}
		this.menuRoot.find(".carte-selector input").bind("keyup", function(event) {
			if (event.keyCode == 13) {
			    var diagramName = $(this).val().trim();
			    var diagram = _.find(self.options.diagrams, function(obj){ return obj.name == diagramName; });
			    self.loadDiagram(diagram);
			}
		});
		// init multi-panes
		var $multiPanes = this.menuRoot.find(".panel-multipanes");	
		var maxHeight = Math.max.apply(null, $multiPanes.map(function ()
		{
			return $(this).height();
		}).get());				
		$multiPanes.css("min-height", maxHeight+"px");
		
		this.editionPanel = new EditionPanel(this.menuRoot.find(".panel-edition"), this);
		this.editionPanel.addObserver(function(event, subject) {
			self.manageEvent(event, subject);
		});
	}
	showPanel($panel) {
		$panel.closest(".panel-multipanes").children().removeClass("selected");
		$panel.addClass("selected");
	}
	enableTextEditor(text) {
		this.editionPanel.setValue(text)
		this.showPanel($(".panel-edition"));
		this.editionPanel.focus();
	}
	disableTextEditor() {
		this.showPanel($(".panel-adder"));
		var $input = this.menuRoot.find(".panel-edition input");
		$input.val("");
		$input.prop("disabled", true);
	}
	loadDiagram(diagramData, layoutPanel) {
		var self = this;
		var $carteContainer = layoutPanel == null ? this.layout.getSelectedPanel() : this.layout.getPanel(layoutPanel);
		$carteContainer.empty();
		var carteId = $carteContainer.uniqueId().attr("id");
		var lock1 = this.resolveJsonData(diagramData.urlData);
		var lock2 = this.resolveJsonData(diagramData.urlArchetypes);
        $.when.apply($,[lock1, lock2]).then(function() {
			//calcul la taille du conteneur				
			var params = {
				editor : self,
				data: lock1.result,
				archetypes: lock2.result,
				container: $carteContainer
			};
			var diagramClass = eval(diagramData.type);
			self.currentDiagram = new diagramClass(params);
			//self.currentDiagram = new DiagramArgument(params);
			self.currentDiagram.addObserver(function(event, subject) {
				self.manageEvent(event, subject);
			});
			self.menuRoot.find(".carte-selector input").val(diagramData.name);
        });		
		
		/*$.ajax({
			url: url,
			dataType: "json",
			success: function (data) {
				//calcul la taille du conteneur				
				var params = {
					editor : self,
					data: data,
					container: $carteContainer
				};
				var diagramClass = eval(diagramClassName);
				self.currentDiagram = new diagramClass(params);
				//self.currentDiagram = new DiagramArgument(params);
				self.currentDiagram.addObserver(function(event, subject) {
					self.manageEvent(event, subject);
				});				
			}
		});*/
	}
	resolveJsonData(data) {
		var lock = $.Deferred();
		if (typeof(data) == "string") {
			$.ajax({
				url: data,
				dataType: "json",
				success: function (data) {
					lock.result = data;
					lock.resolve();
				}
			});
		} else {
			lock.result = data;
			lock.resolve();
		}
		return lock;
	}
}