class McButton extends MagicNode {		
    constructor($node) {
        super($node);
        this.oldColor = this.node.css("color");
        this.enable();
    }
    isEnabled() {
    	return this.enabled;
    }
    enable() {
    	this.enabled = true;
    	this.node.spin(false);
    	this.node.css("color", this.oldColor);
    	this.node.addClass("active");
    }
    disable() {
    	this.enabled = false;
    	this.node.spin({
            color: "rgb(27, 29, 31)",
            length: 2
    	});
    	this.node.css("color", "transparent");
    	this.node.removeClass("active");		    
    }		    
}