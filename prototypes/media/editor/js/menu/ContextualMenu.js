class ContextualMenu {

    constructor($node, editor) {
		var self = this;
		this.node = $node;
		this.editor = editor;
    }
	open(diagram, event)	{
		// update actions
		var self = this;
		self.diagram = diagram;
		var $popup = self.gotPopup();
		$popup.attr('width', 300);
		var width = 0;
		var height = 0;		
		var actions = this.computeActions(diagram.getSelection());
		$popup.empty();
		$.each(actions, function(actionName, func) {
			var $div = $('<div class="editor-popup-action"></div>');
			$div.addClass("action");
			$div.html(actionName);
			$popup.append($div);
			var dim = $div[0].getBoundingClientRect();
			width = Math.max(width, dim.width);
			height += $div.outerHeight();			
			$div.bind("click", function(event) {
				event.stopPropagation();
				actions[actionName].func(diagram.getSelection());
				self.close();
			});
		});
		$popup.attr('width', width);
		$popup.attr('height', height+2);		
		// show
		var $popup = this.gotPopup();
		$popup.css("left", event.clientX+"px");
		$popup.css("top", event.clientY+"px");
		$popup.css("visibility", "visible");		
	}
	computeActions(selection) {
		var self = this;
		var actions = {};
		var singleActionNames = new Set();
		$.each(selection, function(index, domElt) {
			var data = d3.select(domElt).data()[0];
			var instance = self.diagram.builder.gotInstance($(domElt), data, self.diagram);
			$.each(instance.getActions(), function(actionName, action) {
				actions[actionName] = action;
				if (!action.multi)
					singleActionNames.add(actionName);
			});
		});
		if (selection.length > 1) {
			$.each(Array.from(singleActionNames), function(index, actionName) {
				delete actions[actionName];
			});
		}
		return actions;
	}
	close() {
		var $popup = this.gotPopup();
		$popup.css("visibility", "hidden");
	}	
	gotPopup() {
		var $body = $("body");
		var $popup = $("body").find(".editor-popup");
		if ($popup.length == 0) {
			$popup = $('<div class="editor-popup" style="z-index: 130; display:grid; visibility:hidden; position:absolute;"></div>')
			$("body").prepend($popup);
		}
		return $popup;
	}
}