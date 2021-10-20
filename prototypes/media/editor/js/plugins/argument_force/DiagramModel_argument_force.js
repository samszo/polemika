class DiagramModel_argument_force extends DiagramModel {

    constructor(params) {
		super();
    }
    normalizeData(data) {
        if (data.kind == "node") {
	        if ("x" in data) {
                if (typeof(data.x) == "string")
                    data.x = parseInt(data.x);
	            data.fx = data.x;
	        }
	        if ("y" in data) {
                if (typeof(data.y) == "string")
                    data.y = parseInt(data.y);
                data.fy = data.y;
	        }
	    } else if (data.kind == "link") {
	        if (data.source == null)
	            data.source = data.src;
	        if (data.target == null)
	            data.target = data.dst;
	    }
    }
    serializeData(data) {
        data = Object.assign({}, data);
        if (data.kind == "node") {
	        delete data["index"];
	        delete data["width"];
	        delete data["height"];
	        delete data["tlCorner"];
	        delete data["vx"];
	        delete data["vy"];
	        delete data["type"];
	        delete data["urlAdmin"];
	    } else if (data.kind == "link") {
	        delete data["index"];
	        delete data["source"];
	        delete data["target"];
	        delete data["urlAdmin"];
	    }
        return data;
    }
}