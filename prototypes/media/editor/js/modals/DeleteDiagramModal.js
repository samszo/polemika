class DeleteDiagramModal {

    constructor(name, style) {
		var self = this;
		this.node = $("#"+name);
		this.openButton = $("button[data-target='#"+name+"']");
		self.node.find("button[action=delete]").bind("click", function() {
            self.diagram.delete(function() {
                self.node.find("button[action=close]").click();
            });
		});
    }
	open(diagram) {
		this.diagram = diagram;
		this.node.find(".diagramName").text(diagram.getName());
		this.openButton.click();
	}
}