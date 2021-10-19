class DiagramModel_argument_force extends DiagramModel {

    constructor(params) {
		super();
    }
    normalizeData(data) {
        if (data.kind == "node") {
	        if (typeof(data.x) == "string")
	            data.x = parseInt(data.x);
	        if (typeof(data.y) == "string")
	            data.y = parseInt(data.y);
	    } else if (data.kind == "link") {
	        if (data.source == null)
	            data.source = data.src;
	        if (data.target == null)
	            data.target = data.dst;
	    }
    }
}