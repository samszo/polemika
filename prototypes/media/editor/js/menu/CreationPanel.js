class CreationPanel {

    constructor(diagram, archetypesData) {
		var self = this;
		this.node = $('<div class="node-adder"><div class="nodeArchetypes connectedSortable"></div></div>');
		this.diagram = diagram;
		this.node.data("object", this);
		this.initArchetypes(archetypesData);
		var $list = this.node.find(".nodeArchetypes");
		var listId = $list.uniqueId().attr("id");
		$list.sortable({
			connectWith: "#listId",
			update : function(e, ui){
				//console.log("> update drag");
			},
            stop: function(e, ui){
                console.log("> stop drag");
                var $movedElt = $(ui.item);
				var editor = self.editor;				
				/*var p = d3.pointer(event);
				var pos = {
					x : p[0],
					y : p[1]
				};*/
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
		$.each(archetypesData, function(index, archetype) {
			archetype = self.diagram.builder.createArchetype(archetype, self.diagram);
			if (archetype.data.type == "node")				
				self.addArchetype(archetype);
		});		
	}
	addArchetype(archetype) {
		//this.archetypes[archetype.data.id] = archetype;
		$(".nodeArchetypes", this.node).append(archetype.node);
	}
}