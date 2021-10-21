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
			console.log("TEST");
            var diagram = self.getCurrentDiagram();
            var nodes = [];
            $.each(diagram.selection, function(index, domElt) {
                nodes.push(diagram.builder.gotInstance($(domElt)));
            });
			self.getCurrentDiagram().startAutoLayout(nodes);
		});
		var $button = $("button[action=save]");
		$button.bind("click", function() {
			var changes = self.getCurrentDiagram().model.getChanges();
			console.log(JSON.stringify(changes, null, 2));
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
					if ($selection.hasClass("node")) {
                        this.editionPanel.setValue($selection.find(".labelNode").text().trim());
                        this.editionPanel.focus();
                        this.menu.enable("menu-edition");
                        this.menu.show("menu-edition");
					} else {
                        this.menu.show(this.lastTab);
                        this.menu.disable("menu-edition");
					}
				} else {
                    this.menu.show(this.lastTab);
                    this.menu.disable("menu-edition");
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
					if (value != this.editionPanel.oldValue) {
					    var node = diagram.builder.gotInstance($selection);
					    node.setLabelText(value);
					}
				}
			}
		}
	}
	getObject($elt) {
		return $elt.data("object");
	}
	initMenu() {
		var self = this;
		this.menu = new Tabs($("#tab-example"));
		this.lastTab = this.menu.currentTab;
		this.menu.addObserver(function(event, subject) {
			if (self.menu.currentTab != "menu-edition")
			    self.lastTab = self.menu.currentTab;
		});
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
			self.currentDiagram.load(lock1.result);
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
			this.api.getJSON(
			    data,
			    function(data) {
					lock.result = data;
					lock.resolve();
			    }
			)
		} else {
			lock.result = data;
			lock.resolve();
		}
		return lock;
	}
}