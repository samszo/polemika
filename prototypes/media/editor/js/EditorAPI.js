class EditorAPI extends ProtoAPI {

    constructor(proto) {
        super(proto);
        this.useLocalData = true;
	}
	getDiagrams(callback) {
        var url = 'https://polemika.univ-paris8.fr/omk/s/api/page/ajax?type=diagramme&action=getDiagrammes';
        if (this.useLocalData)
            url = '/media/editor/data/diagramme_local.json';
        this.getJSON(
            url,
            function(data) {
                callback(data);
            }
        );
	}
	changeDiagramName(diagramData, newName, callback) {
	    console.log("TODO EditorAPI.changeDiagramName", diagramData, newName);
	    // TODO enable waiter ...
	    // TODO	 call sevrer
	    // when done ...
	        // TODO disable waiter
	        // callback(true);
	        callback("a diagram exists with this name"); // if the diagram can not be renamed, give a feedback
	}
	deleteDiagram(diagramData, callback) {
	    console.log("TODO EditorAPI.deleteDiagram", diagramData);
	    // TODO enable waiter ...
	    // TODO	 call sevrer
	    // when done ...
	        // TODO disable waiter
	        callback();
	}
	getConceptsDansCrible(callback) {
        var self = this;
        if (this.conceptsDansCrible != null)
            callback(this.conceptsDansCrible);
        else {
            var url = 'https://polemika.univ-paris8.fr/omk/api/items?resource_template_id=41&sort_by=created&sort_order=desc';
            if (this.useLocalData)
                url = '/media/editor/data/conceptDansCrible.json';
            this.getJSON(
                url,
                function(data) {
                    data = jsonPath(data, "*.o:title");
                    self.conceptsDansCrible = data;
                    callback(data);
                }
            );
        }
	}
	getDiagramFragment(callback) {
        var url = '/media/editor/data/import3.json';
        this.getJSON(
            url,
            function(data) {
                callback(data);
            }
        );
	}
}