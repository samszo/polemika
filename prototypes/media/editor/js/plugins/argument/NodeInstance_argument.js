class NodeInstance_argument extends NodeInstance {

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
					var url = 'http://127.0.0.1:5000/media/data/editor/import2.json';
					self.diagram.importData(url);
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
}