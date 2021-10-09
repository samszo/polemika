class NodeArchetype_argument extends Archetype {

    constructor(data, diagram) {
		super(data, diagram);
		var self = this;
    }
	instanciate(domElt, data, diagram) {
		var instance = new NodeInstance_argument(domElt, data, this, diagram);
		this.addInstance(instance);
		return instance;
	}
}