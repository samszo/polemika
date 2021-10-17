class LinkInstance_argument_force extends LinkInstance {

    constructor(domElt, data, archetype, diagram) {
		super(domElt, data, archetype, diagram);
		this.sourceNode = null;
		this.targetNode = null;
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
	graphUpdate(d3Node) {
	    console.log("LinkInstance_argument_force> graphUpdate");
	}
	graphEnter(d3Node) {
        console.log("LinkInstance_argument_force> graphEnter");
        var self = this;
        d3Node.attr("stroke", "#999")
        .attr("stroke-width", function(d) {
            return 3;
        });
	}
	graphExit(d3Node) {
	    console.log("LinkInstance_argument_force> graphExit");
	}
}