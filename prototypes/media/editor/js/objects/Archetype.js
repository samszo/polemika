class Archetype extends StyledObject {

    constructor(data, diagram) {
		super(data, diagram);
		var self = this;
		self.node = $('<div class="nodeArchetype" data-id='+data.id+'>'+data.name+'</div>');
		self.updateRenderStyle();		
		self.computeStyleTable(data.cssStyle);
		self.node.data("archetype", data);
		self.node.bind("dblclick", function(index, value) {
			self.diagram.editor.nodeStyleModal.open(self);
		});
		self.instances = [];
    }
	updateStyleTable(styleTable) {
		super.updateStyleTable(styleTable);
		this.updateRenderStyle();
	}
	updateRenderStyle() {
		this.node.attr("style", this.data.cssStyle);
	}
	setName(name) {
		this.data.name = name;
	}
	instanciate(domElt, data, diagram) {
		var instance = new Instance(domElt, data, this, diagram);
		this.addInstance(instance);
		return instance;
	}
	addInstance(instance) {
		this.instances.push(instance);
	}
	deleteInstance(instance) {
		this.instances.splice(this.instances.indexOf(instance), 1);
	}
}