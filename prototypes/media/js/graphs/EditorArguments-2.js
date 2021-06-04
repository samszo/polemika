class EditorArguments {

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
		this.initLayout();		
		this.carteTranslation = {
			x : 13,
			y : -230,
			k : 1.48
		}
		this.initMenu();
    }
	initLayout() {
		var self = this;
		this.setLayout(this.options.layout);		
		var $container = $(".polemika-editor-instance-container");
		$container.children().bind("click", function() {
			$container.children().removeClass("selected");
			$(this).addClass("selected");
		});		
	}
	getSelectedCarte() {
		return this.carteContainer.children(".selected");
	}
	setLayout(layout) {
		this.options.layout = layout;
		if (layout == "full")
			$(".polemika-editor-instance-container").children(":not(.selected)").addClass("hide");
		else {
			$(".polemika-editor-instance-container").children().removeClass("hide");
			if (layout == "split-v")
				$(".polemika-editor-instance-container").css("flex-flow", "column");
			else
				$(".polemika-editor-instance-container").css("flex-flow", "row");
		}
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
                var diagram = self.getSelectedCarte().data("diagram");
				var pos = {
					x : (ui.position.left)*self.carteTranslation.k + self.carteTranslation.x,
					y : (ui.position.top)*self.carteTranslation.k + self.carteTranslation.y
				};				
				diagram.createNode(pos, $movedElt.data("archetype"));
            }		  
		}).disableSelection();		
		// bind external actions		
		this.menuRoot.find(".carte-layout-selector").bind("change", function() {
			var layout = $(this).val();
			self.setLayout(layout);
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
					self.loadCarte(carteUrl, ".footer");
				}
			});
		}
		this.menuRoot.find(".carte-selector input").bind("keyup", function(event) {
			if (event.keyCode == 13)
				self.loadCarte($(this).val(), ".footer");
		});		
		
		this.menuRoot.find(".text-editor input").focusout(function() {
			var diagram = self.getSelectedCarte().data("diagram");
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
	loadCarte(url, footerSelector) {
		var self = this;
		var $carteContainer = self.getSelectedCarte();
		$carteContainer.empty();
		var carteId = $carteContainer.uniqueId().attr("id");
		$.ajax({
			url: url,
			dataType: "json",
			success: function (data) {
				//calcul la taille du conteneur
				let contFooter = d3.select(footerSelector).node()
				let contCarte = d3.select("#"+carteId).node();            
				var diagram = new DiagramArgument({
					'editor' : self,
					'data':data,
					'idCont':carteId,
					'width':contCarte.offsetWidth,
					'height':contFooter.offsetTop-contCarte.offsetTop
				});
				$carteContainer.data("diagram", diagram);
			}
		});
	}
}