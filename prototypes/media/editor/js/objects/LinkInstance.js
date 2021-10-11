class LinkInstance extends Instance {

    constructor(domElt, data, archetype, diagram) {
		super(domElt, data, archetype, diagram);
    }
	delete(doUpdate) {		
		this.diagram.model.notifyDeletion(this.data);
		this.diagram.deleteLink(this);
		if (doUpdate)
			this.diagram.updateGraph();
	}
}