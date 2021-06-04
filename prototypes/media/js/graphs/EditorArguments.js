class EditorArguments {

    constructor($menuRoot, $carteRoot) {
		var self = this;
		this.menuRoot = $menuRoot;
		this.carteRoot = $carteRoot;
		this.carte = null;
		// bind external actions		
		this.menuRoot.find(".createNode").bind("click", function() {
			self.carte.createNode();
		});
		this.menuRoot.find(".text-editor input").focusout(function() {
			self.carte.changeText(self.selection, $(this).val());
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
		self.carteTranslation = {
			x : 13,
			y : -230,
			k : 1.48
		}
		self.initArchetypes();
		$(".nodeArchetypes").sortable({
			connectWith: ".connectedSortable",
            stop: function(e, ui){
                console.log("> stop drag");
                var $movedElt = $(ui.item);
                var pos = {
					x : (ui.position.left)*self.carteTranslation.k + self.carteTranslation.x,
					y : (ui.position.top)*self.carteTranslation.k + self.carteTranslation.y
				};				
				self.carte.createNode(pos, $movedElt.data("archetype"));
            }		  
		}).disableSelection();
		
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
	enableTextEditor(text) {
		var $input = this.menuRoot.find(".text-editor input");
		$input.val(text);
		$input.prop("disabled", false);
	}
	disableTextEditor() {
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
	loadCarte(url) {
		var self = this;
		$.ajax({
			url: url,
			dataType: "json",
			success: function (data) {
				//calcul la taille du conteneur
				let contFooter = d3.select(".footer-section").node()
				let contCarte = d3.select("#contCarte").node();            
				self.carte = new carteArgument({
					'editor' : self,
					'data':data,
					'idCont':'contCarte',
					'width':contCarte.offsetWidth,
					'height':contFooter.offsetTop-contCarte.offsetTop
				});
			}
		});
	}
}