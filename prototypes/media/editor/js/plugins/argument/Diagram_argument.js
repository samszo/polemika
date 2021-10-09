class Diagram_argument extends Diagram {

    constructor(params) {
        super(params);
		this.model = new DiagramModel_argument();
    }
	createBuilder() {
		return new DiagramBuilder_argument(this);
	}
}