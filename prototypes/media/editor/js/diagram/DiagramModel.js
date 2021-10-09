class DiagramModel {

    constructor(params) {		
		this.data = {
			created: [],
			deleted: [],
			updated: []
		};
    }
	notifyCreation(element) {
		console.log("DiagramModel->notifyCreation");
		if (!_.contains(this.data.created, element))
			this.data.created.push(element);
	}
	notifyChange(element) {
		console.log("DiagramModel->notifyChange");
		if (!_.contains(this.data.updated, element) && !_.contains(this.data.created, element))
			this.data.updated.push(element);
	}
	notifyDeletion(element) {
		console.log("DiagramModel->notifyDeletion");
		if (!_.contains(this.data.deleted, element))
			this.data.deleted.push(element);
		if (_.contains(this.data.created, element))
			this.data.created.slice(this.data.created.indexOf(element), 1);
		if (_.contains(this.data.updated, element))
			this.data.updated.slice(this.data.updated.indexOf(element), 1);		
	}
	getChanges() {
		/*var result = {
			created: $.map(this.data.created, function(obj) { return obj.data; }),
			deleted: $.map(this.data.deleted, function(obj) { return obj.data; }),
			updated: $.map(this.data.updated, function(obj) { return obj.data; })
		};
		return result;*/
		return this.data;
	}
}