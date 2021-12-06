class CreationPanelContainer {

    constructor($node) {
		var self = this;
		this.node = $node;
    }
	createCreationPanel(diagram, archetypesData) {
        var creationPanel = diagram.builder.createCreationPanel(diagram, archetypesData);
        this.node.empty();
        this.node.append(creationPanel.node);
        return creationPanel;
	}
}