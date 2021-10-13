class RequestEngine extends RequestElement {

    constructor($node, proto) {
		super($node, null);
		var self = this;
		this.rtFields = {}
		this.builder = new RequestBuilder(this);
		this.api = new RequestAPI(proto);
        $(".searchButton", this.node).bind("click", function() {
            self.notifyObservers({ name : "search" })
        });
    }
    loadDefaultRequest() {
		var operator = this.builder.createOperator();
		this.add(operator);
		var newRequest = this.builder.createPredicateRequest();
		operator.add(newRequest);
    }
	serialize() {
		return $(".request-element", this.node).first().data("dom-object").serialize();
	}
	loadRequest(request) {
        console.log("loadRequest", request);
        this.node.children(".request-elements").empty();
        this.walkRequest(request, this);
	}
	walkRequest(request, currentElement) {
        var self = this;
        var createdElement = null;
        if (request.type == "BooleanOperator")
            createdElement = this.builder.createOperator(request);
        else
            createdElement = this.builder.createPredicateRequest(request);
        currentElement.add(createdElement);
        $.each(request.children, function(index, child) {
            self.walkRequest(child, createdElement);
        });
	}
}

