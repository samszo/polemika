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
				console.log("ui", ui.position.left, ui.position.top);
                var cont = d3.select("g.container");
                var pointer = d3.pointer(e, cont);
                var pos3 = {
					x : pointer[0],
					y : pointer[1]
				};

                var pos = {
					x : ui.position.left,
					y : ui.position.top
				};
				pos = {
					x : pos.x*self.diagram.editor.carteTranslation.k + self.diagram.editor.carteTranslation.x,
					y : pos.y*self.diagram.editor.carteTranslation.k + self.diagram.editor.carteTranslation.y
				};
                if (self.diagram.currentTransform) {
                    //pos.x = pos.x / self.diagram.currentTransform.k;
                    //pos.y = pos.y / self.diagram.currentTransform.k;
                    pos.x = pos.x - self.diagram.currentTransform.x;
                    pos.y = pos.y - self.diagram.currentTransform.y;
                }
				var position = pos;
				var nodeData = self.diagram.builder.createNode($movedElt.data("archetype"));
				//var nodeData = diagram.model.createNode($movedElt.data("archetype"));
				var $node = diagram.addNode(nodeData, position);
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