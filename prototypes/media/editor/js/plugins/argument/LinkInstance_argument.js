class LinkInstance_argument extends Instance {

    constructor(domElt, data, archetype, diagram) {
		super(domElt, data, archetype, diagram);
		this.sourceNode = null;
		this.targetNode = null;
    }
	/* to be overridden */
	getActions(instance) {
		return {};
	}	
}