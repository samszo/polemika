class DiagramModel {

    constructor(params) {
		this.changes = [];
		this.idCounter = -1;
    }
	notifyChange(element) {
		if (!_.contains(this.changes, element))
			this.changes.push(element);
	}
	getNewId() {
		return this.idCounter--;
	}
}