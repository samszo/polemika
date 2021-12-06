class RenameDiagramModal {

    constructor(name, style) {
		var self = this;
		this.node = $("#"+name);
		this.openButton = $("button[data-target='#"+name+"']");
		this.nameInput = new PTextInput(this.node.find("[data-input-field=name]"));
		this.nameInput.addObserver(function(event) {
			self.nameInput.setAsValid();
		});
		self.node.find("button[action=save]").bind("click", function() {
            self.diagram.setName(self.nameInput.getValue(), function(result) {
                if (result == true)
                    self.node.find("button[action=close]").click();
                else {
                    self.nameInput.setAsInvalid(result);
                }
            });
		});
    }
	open(diagram) {
		this.diagram = diagram;
		this.nameInput.setValue(diagram.getName());
		this.nameInput.setAsValid();
		this.openButton.click();
	}
}