class RequestEngineNode extends MagicNode {

    constructor($node, engine) {
		super($node);
		this.engine = engine;
    }
}
class RequestBuilder {
	
    constructor(engine) {
		this.engine = engine;
    }
	
	createOperator() {
		var $node = $(`
			<div class="request-element request-operator input-group mb-3">
				<div class="input-group-prepend">
					<select class="operator-value custom-select" id="inputGroupSelect01">
						<option value="and" selected>AND</option>
						<option value="or">OR</option>
					</select>
				</div>
				<div class="operator-body form-control" style="height: auto;">
					<div class="request-elements">
					</div>					
				</div>				
			</div>`);
		return new RequestOperator($node, this.engine);
	}
	createDateRequest() {
		var $node = $(`
			<div class="request-element input-group mb-3">
				<div class="input-group-prepend">
					<label class="input-group-text">Date</label>
					<select class="custom-select">
						<option value="inf" selected>inf.</option>
						<option value="equals">equ.</option>
						<option value="sup">sup.</option>
					</select>
				</div>
				<input type="text" class="form-control" placeholder="" aria-label="" aria-describedby="basic-addon1">
			</div>
		`);
		return new DateRequest($node, this.engine);
	}
	createTitleRequest() {
		var $node = $(`
			<div class="request-element input-group mb-3">
				<div class="input-group-prepend">
					<label class="input-group-text">Title</label>
					<select class="custom-select">
						<option value="contains" selected>cont.</option>
						<option value="equals">equ.</option>
						<option value="starts">starts</option>
						<option value="ends">ends</option>
					</select>
				</div>
				<input type="text" class="form-control" placeholder="" aria-label="" aria-describedby="basic-addon1">
			</div>
		`);
		return new TitleRequest($node, this.engine);
	}
	createTypeRequest() {
		var $node = $(`
			<div class="request-element input-group mb-3">
				<div class="input-group-prepend">
					<label class="input-group-text">Type</label>
				</div>
				<select class="custom-select">
					<option value="culture" selected>culture</option>
					<option value="economie">economie</option>
					<option value="people">people</option>
					<option value="actualités">actualités</option>
				</select>
			</div>
		`);
		return new TypeRequest($node, this.engine);
	}
	createRequestAdderButton() {
		var $node = $(`
			<div class="request-element-adder dropdown">
				<button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
				+
				</button>
				<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
					<a class="dropdown-item" value="createOperator" href="#">Operator</a>
					<a class="dropdown-item" value="createDateRequest" href="#">Date</a>
					<a class="dropdown-item" value="createTitleRequest" href="#">Title</a>
					<a class="dropdown-item" value="createTypeRequest" href="#">Type</a>
				</div>
			</div>`);
		return new BDropdownMenu($node);
	}
	createRequestRemoverButton() {
		var $node = $(`<button class="request-element-remover">-</button>`);
		return new BButton($node);
	}	
	
}
class RequestElement extends RequestEngineNode {

    constructor($node, engine) {
		super($node, engine);
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
class RequestEngine extends RequestElement {

    constructor($node) {
		super($node, null);
		this.builder = new RequestBuilder(this);
		var operator = this.builder.createOperator();
		this.add(operator);
		var titleRequest = this.builder.createTitleRequest();
		operator.add(titleRequest);
    }
	serialize() {
		return this.node.find(".request-element").eq(0).data("dom-object").serialize();
	}
}
class RequestOperator extends RequestElement {

    constructor($node, engine) {
		super($node, engine);
    }
	remove(element) {
		super.remove(element);
		this.showHideOperator();
	}
	init() {
		super.init();
		var self = this;
		var adder = this.engine.builder.createRequestAdderButton();
		this.node.find(".operator-body").append(adder.node);
		adder.addObserver(function(event) {
			var element = self.engine.builder[event.item]();
			self.add(element);
			self.showHideOperator();
		});
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
		$.each(this.node.find(".request-elements").children(), function(index, value) {
			children.push($(value).data("dom-object").serialize());
		});
		return {
			type: "RequestOperator",
			operator: this.node.find("select").eq(0).val(),
			children: children
		};
	}
}
class DateRequest extends RequestElement {

    constructor($node, engine) {
		super($node, engine);
		var remover = this.engine.builder.createRequestRemoverButton();
		$node.append(remover.node);
		remover.addObserver(function(event) {
			var element = remover.node.closest(".request-element").data("dom-object");
			element.getParent().remove(element);
			//console.log(event);
			//remover.node.closest(".request-element").remove();
		});
    }
	serialize() {		
		return {
			type: "DateRequest",
			kind: this.node.find("select").val(),
			text: this.node.find("input").val()
		};
	}
}
class TitleRequest extends RequestElement {

    constructor($node, engine) {
		super($node, engine);
		var remover = this.engine.builder.createRequestRemoverButton();
		$node.append(remover.node);
		remover.addObserver(function(event) {
			var element = remover.node.closest(".request-element").data("dom-object");
			element.getParent().remove(element);
			//console.log(event);
			//remover.node.closest(".request-element").remove();
		});
    }
	serialize() {		
		return {
			type: "TitleRequest",
			kind: this.node.find("select").val(),
			text: this.node.find("input").val()
		};
	}
}
class TypeRequest extends RequestElement {

    constructor($node, engine) {
		super($node, engine);
		var remover = this.engine.builder.createRequestRemoverButton();
		$node.append(remover.node);
		remover.addObserver(function(event) {
			var element = remover.node.closest(".request-element").data("dom-object");
			element.getParent().remove(element);
			//console.log(event);
			//remover.node.closest(".request-element").remove();
		});
    }
	serialize() {		
		return {
			type: "TypeRequest",
			value: this.node.find("select").val()
		};
	}
}
class MagicActionNode extends MagicNode {

    constructor($node) {
		super($node);
		this.observers = []
    }
    addObserver(callback) {
        this.observers.push(callback);
	}
	notifyObservers(event) {
	    $.each(this.observers, function(index, observer) {
	        observer(event);
	    })
	}	
}
class BDropdownMenu extends MagicActionNode {

    constructor($node) {
		super($node);
	    var self = this;
		$(".dropdown-item", self.node).bind("click", function() {
	        self.notifyObservers({name: "click", item: $(this).attr("value")});
	    });
    }	
}
class BButton extends MagicActionNode {

    constructor($node) {
		super($node);
		var self = this;
	    self.node.bind("click", function(event) {
	        event.preventDefault();
			self.notifyObservers({name: "click"});
	    });
    }	
}

