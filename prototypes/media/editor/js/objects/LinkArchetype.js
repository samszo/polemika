class LinkArchetype extends Archetype {

    constructor(data, diagram) {
		super(data, diagram);
    }
	instanciate(domElt, data, diagram) {
		var instance = new LinkInstance(domElt, data, this, diagram);
		this.addInstance(instance);
		return instance;
	}
}