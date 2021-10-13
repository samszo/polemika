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
	        self.notifyObservers({name: "click", item: $(this).attr("value"), node:$(this)});
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