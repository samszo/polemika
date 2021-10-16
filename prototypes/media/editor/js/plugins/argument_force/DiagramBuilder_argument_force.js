class DiagramBuilder_argument_force extends DiagramBuilder {

    constructor(diagram) {
		super(diagram)
		this.linkArchetype = null;
    }
	/* overridden */
	instanciateArchetype(archetype, diagram) {
		if (archetype.type == "node")
			return new NodeArchetype_argument_force(archetype, diagram);
		else {
			this.linkArchetype = new LinkArchetype_argument_force(archetype, diagram);
			return this.linkArchetype;
		}
	}
	createNode(archetype) {
		var newNode = {
			id:this.newId(),
			idArchetype:archetype.id,
			label:"New node"
		};
		this.diagram.model.notifyCreation(newNode);
		return newNode;
	}
	createLink(sourceNode, targetNode) {
		var newLink = {
			id:this.newId(),
			idArchetype: this.linkArchetype.data.id,
			label:"",
			src:sourceNode.data()[0].id,
			dst:targetNode.data()[0].id,
			style:{
				"from-pos":"center",
				"to-pos":"center",
				"arrowhead":"yes",
				"color":"#000000",
				"lineStyle":"solid"
			}
		};
		this.diagram.model.notifyCreation(newLink);
		return newLink;		
	}	
}