class Editor {

    constructor($node, options) {
		var self = this;
		this.node = $node;
		this.menuRoot = $(".polemika-editor-menu", $node);
		this.carteContainer = $(".polemika-editor-instance-container", $node);		
		this.carte = null;
		this.options = options
		var defaultOptions = {
			layout: "full"
		};
		this.options = $.extend(defaultOptions, options);		
		this.layout = new EditorLayout(this.carteContainer, this.options.layout);
		this.carteTranslation = {
			x : 13,
			y : -230,
			k : 1.48
		}
		this.initMenu();
    }
	getCurrentDiagram() {
		return this.layout.getSelectedPanel();
	}
	initMenu() {
		var self = this;
		// init archetypes
		self.initArchetypes();
		$(".nodeArchetypes").sortable({
			connectWith: ".connectedSortable",
			update : function(e, ui){
				console.log("> update drag");
			},
            stop: function(e, ui){
                console.log("> stop drag");
                var $movedElt = $(ui.item);
                var diagram = self.getCurrentDiagram().data("diagram");
				var pos = {
					x : (ui.position.left)*self.carteTranslation.k + self.carteTranslation.x,
					y : (ui.position.top)*self.carteTranslation.k + self.carteTranslation.y
				};				
				var node = diagram.model.createNode($movedElt.data("archetype"));
				diagram.addNode(node, pos);
            }		  
		}).disableSelection();		
		// bind external actions		
		this.menuRoot.find(".carte-layout-selector").bind("change", function() {
			var layout = $(this).val();
			self.layout.changeMode(layout);
			console.log("layout", layout);
		});
		this.menuRoot.find(".carte-layout-selector").val(self.options.layout);
		// init carte selector
		if (this.options.cartes) {
			var carteIdents = Object.keys(this.options.cartes)
			this.menuRoot.find(".carte-selector input").autocomplete({
				source: carteIdents,
				select: function(event, ui) {					
					var carteUrl = self.options.cartes[ui.item.label];
					console.log(carteUrl);
					self.loadDiagram(carteUrl, self.getCurrentDiagram());
				}
			});
		}
		this.menuRoot.find(".carte-selector input").bind("keyup", function(event) {
			if (event.keyCode == 13)
				self.loadDiagram($(this).val(), self.getCurrentDiagram());
		});		
		
		this.menuRoot.find(".text-editor input").focusout(function() {
			var diagram = self.getCurrentDiagram().data("diagram");
			diagram.changeText(self.selection, $(this).val());
		});
	    var options = {
	        connectWith: ".connectedSortable",
	        cursor: "move",
            items: ".nodeArchetype",
            start: function(e, ui){
                console.log("> start drag");
            },
            stop: function(e, ui){
                console.log("> stop drag");
            },            
	        update: function( event, ui ) {
	        	var $movedElt = $(ui.item);
				console.log("> update drag");
	        }
	    };
		// init multi-panes
		var $multiPanes = this.menuRoot.find(".panel-multipanes");	
		var maxHeight = Math.max.apply(null, $multiPanes.map(function ()
		{
			return $(this).height();
		}).get());				
		$multiPanes.css("min-height", maxHeight+"px");
	}
	initArchetypes() {
		var self = this;
		$.each(self.loadArchetypes(), function(index, archetype) {
			var $archetype = $('<div class="nodeArchetype" data-id='+archetype.id+'>'+archetype.label+'</div>')
			$.each(archetype.style, function(key, value) {
				if (key == "color") {
					key = "background-color";					
				} else if ("border-color") {
					value = "rgba("+value+")";
				} else if (key == "fgTextColor") {
					key = "color";
				}
				$archetype.css(key, value);
			});
			$archetype.data("archetype", archetype);
			$(".nodeArchetypes").append($archetype);
		});
	}
	loadArchetypes() {
		var self = this;
		// TODO load from base
		self.archetypes = [];
		self.archetypes.push({
			id : 0,
			label : "AAA",
			style : {
				"color" : "#EDF4F6",
				"border-color" : "0,0,0,255",
				"fgTextColor" : "#000000"
			},
			type:"concept"
		});
		self.archetypes.push({
			id : 1,
			label : "BBB",
			style : {
				"color" : "#EDF4F6",
				"border-color" : "255,0,255,255",
				"fgTextColor" : "#000000"
			},
			type:"concept"
		});
		self.archetypes.push({
			id : 2,
			label : "CCC",
			style : {
				"color" : "#EDF4F6",
				"border-color" : "255,150,0,255",
				"fgTextColor" : "#000000"
			},
			type:"concept"
		});
		return self.archetypes;
	}	
	showPanel($panel) {
		$panel.closest(".panel-multipanes").children().removeClass("selected");
		$panel.addClass("selected");
	}
	enableTextEditor(text) {
		this.showPanel($(".panel-edition"));
		var $input = this.menuRoot.find(".text-editor input");
		$input.val(text);
		$input.prop("disabled", false);
	}
	disableTextEditor() {
		this.showPanel($(".panel-adder"));
		var $input = this.menuRoot.find(".text-editor input");
		$input.val("");
		$input.prop("disabled", true);
	}
	selectionChange($selection) {
		var self = this;
		self.selection = $selection;
		if ($selection && $selection.hasClass("rectNode")) {
			self.enableTextEditor($selection.parent().find(".labelNode").text().trim());
		} else
			self.disableTextEditor();
	}
	loadDiagram(url, $carteContainer) {
		var self = this;
		if (!$carteContainer)
			$carteContainer = self.getCurrentDiagram();
		$carteContainer.empty();
		var carteId = $carteContainer.uniqueId().attr("id");
		$.ajax({
			url: url,
			dataType: "json",
			success: function (data) {
				//calcul la taille du conteneur				
				var diagram = new DiagramArgument({
					editor : self,
					data: data,
					container: $carteContainer
				});
				$carteContainer.data("diagram", diagram);
			}
		});
	}
	showActions(event) {
		console.log(event);
		var $popup = this.gotPopup();
		$popup.css("left", event.clientX+"px");
		$popup.css("top", event.clientY+"px");
		$popup.css("visibility", "visible");
	}
	hideActions() {
		var $popup = this.gotPopup();
		$popup.css("visibility", "hidden");
	}	
	gotPopup() {
		var $body = $("body");
		var $popup = $("body").find(".editor-popup");
		if ($popup.length == 0) {
			$popup = $('<div class="editor-popup" style="z-index: 130; display:grid; visibility:hidden; position:absolute;"></div>')
			$("body").prepend($popup);
		}
		return $popup;
	}
}