class CreationPanel {

    constructor($node, diagram, archetypesData) {
		var self = this;
		this.node = $node;
		this.diagram = diagram;
		this.node.data("object", this);
		this.initArchetypes(archetypesData);
		this.node.sortable({
			connectWith: ".connectedSortable",
			update : function(e, ui){
				console.log("> update drag");
			},
            stop: function(e, ui){
                console.log("> stop drag");
                var $movedElt = $(ui.item);
				var editor = self.editor;				
				var pos = {
					x : (ui.position.left)*self.diagram.editor.carteTranslation.k + self.diagram.editor.carteTranslation.x,
					y : (ui.position.top)*self.diagram.editor.carteTranslation.k + self.diagram.editor.carteTranslation.y
				};
				/*var pos = {
					x : (ui.position.left)*self.diagram.currentTransform.k + self.diagram.currentTransform.x,
					y : (ui.position.top)*self.diagram.currentTransform.k + self.diagram.currentTransform.y
				};*/				
				var nodeData = self.diagram.builder.createNode($movedElt.data("archetype"));
				//var nodeData = diagram.model.createNode($movedElt.data("archetype"));
				var $node = diagram.addNode(nodeData, pos);
				diagram.setSelection([$node[0]]);
            }		  
		}).disableSelection();				
    }
	initArchetypes(archetypesData) {
		var self = this;
		$.each(archetypesData.archetypes, function(index, archetype) {
			archetype = self.diagram.builder.createArchetype(archetype, self.diagram);
			if (archetype.data.type == "node")				
				self.addArchetype(archetype);
		});		
	}
	addArchetype(archetype) {
		//this.archetypes[archetype.data.id] = archetype;
		$(".nodeArchetypes").append(archetype.node);		
	}
}