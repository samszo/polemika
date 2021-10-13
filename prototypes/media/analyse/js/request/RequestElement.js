class RequestElement extends MagicActionNode {

    constructor($node, engine) {
		super($node);
		this.engine = engine;
    }
	add(element) {
		element.node.addClass("hidden");
		this.node.find(".request-elements").eq(0).append(element.node);
		element.init();
		element.node.removeClass("hidden");
	}
	remove(element) {
		element.node.remove();
	}
	init() {}
	isRoot() {
		return this.getParent() == null;
	}
	getParent() {
		var $parent = this.getParentNode();
		if ($parent)
			return $parent.data("dom-object");
		else
			return null;
	}
	getParentNode() {
		var $parent = this.node.parents(".request-element");
		if ($parent.length > 0)
			return $parent;
		else
			return null;
	}
}