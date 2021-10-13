class RequestOperator extends RequestElement {

    constructor($node, engine, data) {
		super($node, engine);
		var self = this;
		var adder = this.engine.builder.createRequestAdderButton();
		this.operatorSelect = new PSelect($(".operator-value", this.node));
		if (data)
		    this.operatorSelect.setValue(data.name);
		this.node.find(".operator-body").append(adder.node);
		adder.addObserver(function(event) {
			var element = self.engine.builder[event.item]();
			self.add(element);
		});
    }
	add(element) {
	    super.add(element);
	    this.showHideOperator();
	}
	remove(element) {
		super.remove(element);
		this.showHideOperator();
	}
	init() {
		var self = this;
		super.init();
		if (!this.isRoot()) {
			var remover = this.engine.builder.createRequestRemoverButton();
			self.node.append(remover.node);
			remover.addObserver(function(event) {
				var element = remover.node.closest(".request-element").data("dom-object");
				element.getParent().remove(element);
				//remover.node.closest(".request-element").remove();
				//self.showHideOperator();
			});
		}
		this.showHideOperator();
	}
	showHideOperator() {
		if (this.isRoot()) {
			if (this.node.find(".request-elements").eq(0).children().length <= 1)
				this.node.find(".input-group-prepend").eq(0).addClass("hidden");
			else
				this.node.find(".input-group-prepend").eq(0).removeClass("hidden");
		}
	}
	serialize() {
		var children = [];
		$.each(this.node.find(".request-elements").first().children(), function(index, value) {
			children.push($(value).data("dom-object").serialize());
		});
		return {
			type: "BooleanOperator",
			name: this.node.find("select").eq(0).val(),
			children: children
		};
	}
}