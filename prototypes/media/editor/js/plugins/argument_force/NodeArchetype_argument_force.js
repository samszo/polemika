class NodeArchetype_argument_force extends NodeArchetype {

    constructor(data, diagram) {
		super(data, diagram);
    }
    /* overridden */
	instanciate(domElt, data, diagram) {
		var instance = new NodeInstance_argument_force(domElt, data, this, diagram);
		this.addInstance(instance);
		return instance;
	}
}