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
					var url = 'http://127.0.0.1:5000/media/editor/data/import3.json';
                    $.ajax({
                        url: url,
                        dataType: "json",
                        success: function (data) {
                            $.each(data.nodes, function(index, nodeData) {
                                var existingNode = _.find(self.diagram.data.nodes, function(elt) {
                                    return elt.id == nodeData.id;
                                });
                                if (existingNode == null)
                                    self.diagram.data.nodes.push(nodeData);
                            });
                            $.each(data.links, function(index, linkData) {
                                var existingLink = _.find(self.diagram.data.links, function(elt) {
                                    return elt.id == linkData.id;
                                });
                                if (existingLink == null)
                                    self.diagram.data.links.push(linkData);
                            });
                            self.diagram.updateGraph();
                        }
                    });
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