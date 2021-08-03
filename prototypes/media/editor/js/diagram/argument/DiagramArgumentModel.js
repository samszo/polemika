class DiagramArgumentModel extends DiagramModel {

    constructor(params) {
		super();
    }
	createNode(archetype) {
		var newNode = {
			idConcept:76146,
			urlAdmin:"/polemika/omk/admin/item/76146/edit"
		};
		newNode = Object.assign(newNode, archetype);
		newNode.id = this.getNewId();
		this.notifyChange(newNode);
		return newNode;
	}
	setNodePosition(node, position) {
		node.x = position.x;
		node.y = position.y;
		this.notifyChange(node);
	}	
}