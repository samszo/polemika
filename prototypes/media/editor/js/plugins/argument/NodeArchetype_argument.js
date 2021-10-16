class NodeArchetype_argument extends NodeArchetype {

    constructor(data, diagram) {
		super(data, diagram);
    }
    /* overridden */
	instanciate(domElt, data, diagram) {
		var instance = new NodeInstance_argument(domElt, data, this, diagram);
		this.addInstance(instance);
		return instance;
	}
}