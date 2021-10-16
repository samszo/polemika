class LinkArchetype_argument_force extends LinkArchetype {

    constructor(data, diagram) {
		super(data, diagram);
    }
    /* overridden */
	instanciate(domElt, data, diagram) {
		var instance = new LinkInstance_argument_force(domElt, data, this, diagram);
		this.addInstance(instance);
		return instance;
	}
}