class DiagramBuilder {

    constructor(diagram) {
		this.diagram = diagram;
		this.archetypes = {};
		this.creationCounter = 0;
    }
	createCreationPanel(diagram, archetypesData) {
		return new CreationPanel(editor.menuRoot.find(".nodeArchetypes"), diagram, archetypesData);
	}
	newId() {
		this.creationCounter = this.creationCounter - 1;
		return this.creationCounter;
	}
	gotInstance(domElt, data, diagram) {
		var instance = domElt.data("object");
		if (instance == null) {
			var archetype = this.getArchetype(data.idArchetype);
			instance = archetype.instanciate(domElt, data, diagram)			
		}
		return instance;
	}
	createArchetype(archetype, diagram) {
		if (archetype.id == null)
			archetype.id = this.newId();
		var archetype = this.instanciateArchetype(archetype, diagram);
		this.archetypes[archetype.data.id] = archetype;		
		return archetype;
	}
	instanciateArchetype(data, diagram) {
		return new Archetype(data, diagram);
	}
	getArchetype(archetypeId) {
		return this.archetypes[archetypeId];
	}	
}