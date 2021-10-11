class NodeInstance extends Instance {

    constructor(domElt, data, archetype, diagram) {
		super(domElt, data, archetype, diagram);
    }
	delete(doUpdate) {
		var  self = this;
		this.archetype.deleteInstance(this);
		this.diagram.model.notifyDeletion(this.data);
		this.diagram.deleteNode(this);
		$.each(this.inputs, function(index, link) {
			link.delete(false);
		});
		$.each(this.outputs, function(index, link) {
			link.delete(false);
		});
		if (doUpdate)
			this.diagram.updateGraph();
	}	
}