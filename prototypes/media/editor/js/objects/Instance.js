class Instance extends StyledObject {

    constructor(domElt, data, archetype, diagram) {
		super(data, diagram);
		var self = this;
		self.domElt = domElt;
		self.archetype = archetype;
		self.diagram = diagram;
		self.domElt.data("object", self);		
		self.computeStyleTable(data.cssStyle);
    }
	/* to be overridden */
	getActions() {
		return {};
	}	
	changeArchetype(archetype) {
		this.archetype.deleteInstance(this);
		archetype.addInstance(this);
		this.archetype = archetype;
		this.data.idArchetype = archetype.data.id;
		this.diagram.model.notifyChange(this.data);
	}
	getStyleTable() {
		if (this.styleTable != null)
			return this.styleTable;
		else
			return this.archetype.getStyleTable();
	}
	updateStyleTable(styleTable) {
		if (this.styleTable == null)
			this.styleTable = {};
		super.updateStyleTable(styleTable);		
	}
	renderNodeStyle() {
		var rect = d3.select(this.domElt[0]);
		this.diagram.computeNodeStyle(rect);
	}
	getStyle() {
		if (this.styleTable == null)
			return this.archetype.getStyle();
		else
			return this.data.cssStyle;
	}
}