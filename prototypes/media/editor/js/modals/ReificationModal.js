class ReificationModal {

    constructor(name) {
		var self = this;
		this.node = $("#"+name);
		this.openButton = $("button[data-target='#"+name+"']");
		this.nameInput = new PTextInput(this.node.find("[data-input-field=name]"));		
		self.node.find("button[action=create]").bind("click", function() {
			self.create();
			self.node.find("button[action=close]").click();
		});
    }
	create() {
		var self = this;		
		var name = this.nameInput.getValue();
		var cssStyle = this.instance.getStyle();
		console.log("create", name, cssStyle);
		var archetype = {						
			"name":name,
			"type":"node",
			"cssStyle":cssStyle
		}		
		var archetype = this.instance.diagram.builder.createArchetype(archetype, this.instance.diagram);
		this.instance.diagram.model.notifyCreation(archetype.data);
		this.instance.diagram.creationPanel.addArchetype(archetype);
		this.instance.changeArchetype(archetype);		
		this.instance.styleTable = null;
	}
	open(instance) {
		this.instance = instance;
		this.openButton.click();
	}
}