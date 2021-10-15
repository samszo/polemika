/** Part of MagicCms
 * @author Erwan Brottier - erwan@addictive-web.com - http://www.addictive-web.com
 * @version 2.0
 * @date 01/01/2020
 * @category Thot web component
 * @copyright (c) 2011-2020 Erwan Brottier */
class McModal extends MagicObject { 

    constructor($content, actions, headerText) {
        super();
        this.node = $(".mc-modal");
        var self = this;
        self.node.find(".mc-modal-header .mc-modal-title").text(headerText);
        self.node.find(".mc-modal-content .mc-modal-body").empty();
        self.node.find(".mc-modal-content .mc-modal-body").append($content);
        var $buttons = $(".mc-modal-footer").find(".buttons");
        $buttons.empty();
        var cancelCallback = null;
        if (actions) {
			$.each(actions, function(index, value) {
				cancelCallback = null;
				if (value.action == "cancel" && value.callback)
					cancelCallback = value.callback;
				else {
					var $button = $("<button class='mc-admin-button brd'>"+value.action+"</button>");
					$buttons.append($button);
					var button = new McButton($button);
					button.node.unbind("click").bind("click", function() {
						if (button.isEnabled()) {
							button.disable();
							var callback = value.callback;
							var lock = $.orchestrator.createLock();
							self.callAction(callback, button);
						}                
					});
				}
			});
		}
        self.node.find(".close").unbind("click").bind("click", function() {
            var lock = $.orchestrator.createLock();
            self.callAction(cancelCallback);
        });
        // When the user clicks anywhere outside of the modal, close it
        //window.onclick = function(event) {
        //  if (event.target == modal) {
        //    modal.style.display = "none";
        //  }
        //}
    }
    callAction(callback, button) {
        var self = this;
        var lock = $.orchestrator.createLock();
        if (callback)
            callback(lock);
        else
            lock.resolve();
        $.orchestrator.sync(lock, function() {
            if (button)
                button.enable();
            self.hide();
        });
    }
    show() {
        this.node.css("display", "flex");        
    }
    hide() {
        this.node.css("display", "none");
    }
}

