class Diagram {

    constructor(params) {
        var self = this;
    }
	getActions(domElt, data) {
		var self = this;
		return {
			"supprimer" : function($rectNode) {
				console.log("supprimer", d3Node);
				var d3Node = d3.select($rectNode.parent()[0]);
				self.deleteNode(d3Node, true);
			},
			"autre" : function(d3Node) {
				console.log("autre action", d3Node);
			}
		};
	}
	updatePopupActions(domElt, data) {
		console.log("UPDATE POPUP");
		var self = this;
		var $popup = self.editor.gotPopup();
		$popup.attr('width', 300);
		var width = 0;
		var height = 0;		
		var updateActions = self.getActions(domElt, data);
		$popup.empty();
		$.each(updateActions, function(actionName, func) {
			var $div = $('<div class="editor-popup-action"></div>');
			$div.addClass("action");
			$div.html(actionName);
			$popup.append($div);
			var dim = $div[0].getBoundingClientRect();
			width = Math.max(width, dim.width);
			height += $div.outerHeight();			
			$div.bind("click", function(event) {
				event.stopPropagation();
				updateActions[actionName](self.selection);
				self.editor.hideActions();
			});
		});
		$popup.attr('width', width);
		$popup.attr('height', height+2);
	}
}