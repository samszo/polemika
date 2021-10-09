class PSubject {
	constructor() {
	    this.observers = []
	}
    addObserver(callback) {
        this.observers.push(callback);
		return this;
	}
	notifyObservers(event) {
	    var self = this;
		$.each(this.observers, function(index, observer) {
	        observer(event, self);
	    })
	}
}

class PObject extends PSubject {

	constructor($node) {
	    super();
		this.node = $node
	    $node.data("PObject", this);
	}
	uniqueId() {
        return this.node.uniqueId().attr("id");
	}
}

class PButton extends PObject {
	constructor($node) {
	    super($node);
	    var self = this;
	    self.node.bind("click", function(event) {
	        console.log("click");
            self.notifyObservers({
                name: "click",
                target: self,
                original: event
            });
	    });
    }
}
class PInputField extends PObject {
	constructor($node) {
	    super($node);
	    this.initFieldNode();
	    this.bindChange();
	    this.node[0].disabled = false;
    }
    bindChange() {
        var self = this;
	    if (self.fieldNode) {
            self.fieldNode.bind("keyup blur change input", function(event) {
                self.setAsValid();
                self.notifyObservers({
                    name: "valueChanged",
                    target: self,
                    original: event
                });
            });
	    }
    }
    setAsInvalid(message) {
        if (message)
            this.node.find(".invalid-feedback").text(message);
        if (this.fieldNode)
            this.fieldNode.addClass("is-invalid");
    }
    setAsValid() {
        if (this.fieldNode)
            this.fieldNode.removeClass("is-invalid");
    }
    getValue() {
        return this.fieldNode.val();
    }
    setValue(value) {
        this.fieldNode.val(value);
    }
    clear() {
        this.setValue("");
    }
    setEnabled(enabled) {
        this.fieldNode[0].disabled = !enabled;
    }
}
class PTextarea extends PInputField {

	constructor($node) {
	    super($node);
        this.fieldNode[0].setAttribute('autocomplete', 'off');
        this.fieldNode[0].setAttribute('autocorrect', 'off');
        this.fieldNode[0].setAttribute('autocapitalize', 'off');
        this.fieldNode[0].setAttribute('spellcheck', false);
	}
	initFieldNode() {
	    this.fieldNode = this.node.find("textarea").addBack('textarea');
	    if (this.fieldNode.length == 0) {
	        this.node = this.node.replaceTag('<textarea>', true);
	        this.fieldNode = this.node;
	    }
	}
	autosize() {
        this.fieldNode.each(function () {
            this.setAttribute("style", "height:" + (this.scrollHeight) + "px;overflow-y:hidden;");
        }).on("input", function () {
            this.style.height = "auto";
            this.style.height = (this.scrollHeight) + "px";
        });
	}
    setEnabled(enabled) {
        this.fieldNode[0].disabled = !enabled;
    }
}

class PTextInput extends PInputField {

	constructor($node) {
	    super($node);
	    var self = this;
	}
	initFieldNode() {
	    this.fieldNode = this.node.find("input").addBack('input');
	}
    bindChange() {
        var self = this;
	    if (self.fieldNode) {
            self.fieldNode.bind("change input", function(event) {
                self.setAsValid();
                self.notifyObservers({
                    name: "valueChanged",
                    target: self,
                    original: event
                });
            });
	    }
    }	
}

class PIntegerInput extends PTextInput {

	constructor($node) {
	    super($node);
	}
    bindChange() {
        var self = this;
	    if (self.fieldNode) {
            self.fieldNode.bind("change input", function(event) {
                var value = self.getValue()
				if (/^\d+$/.test(value)) {
					self.setAsValid();
					self.notifyObservers({
						name: "valueChanged",
						target: self,
						original: event
					});
				} else {
					self.setAsInvalid();
				}
            });
	    }
    }
}

class PPixelNumberInput extends PIntegerInput {

	constructor($node) {
	    super($node);
	}
    bindChange() {
        var self = this;
	    if (self.fieldNode) {
            self.fieldNode.bind("change input", function(event) {
                var value = self.fieldNode.val();
				if (/^\d+$/.test(value)) {
					self.setAsValid();
					self.notifyObservers({
						name: "valueChanged",
						target: self,
						original: event
					});
				} else {
					self.setAsInvalid();
				}
            });
	    }
    }	
    setValue(value) {
        this.fieldNode.val(parseInt(value));
    }
    getValue() {
        return this.fieldNode.val()+"px";
    }
}

class PColorChooser extends PObject {
	constructor($node) {
	    super($node);
		var self = this;
		this.node.spectrum({
		    type: "text",
			change: function(color) {
                //self.value = color.toHexString(); // #ff0000
				self.notifyObservers({
                    name: "valueChanged",
                    target: self,
                    original: event
                });
			}		  
		});
    }
    getValue() {
        //return this.value;
		return this.node.spectrum("get").toHexString();
    }
    setValue(value) {
        this.node.spectrum("set", value);
    }
}

class PCheckButton extends PInputField {

	constructor($node, trueValue, falseValue) {
	    super($node);
	    var self = this;
		self.trueValue = trueValue;
		self.falseValue = falseValue;
	}
	initFieldNode() {
	    this.fieldNode = this.node.find("button").addBack('button');
	}
    getValue() {
        if (this.fieldNode.attr("aria-pressed") == "true")			
			return this.trueValue;
		else
			return this.falseValue;
    }
    setValue(value) {
		if (value == this.trueValue) {
			this.fieldNode.attr("aria-pressed", "true");
			this.fieldNode.addClass("active");
		} else {
			this.fieldNode.attr("aria-pressed", "false");
			this.fieldNode.removeClass("active");
		}
    }
    bindChange() {
        var self = this;
	    self.fieldNode.bind("click", function(event) {
	        self.setAsValid();
			setTimeout(function(){
				self.notifyObservers({
					name: "valueChanged",
					target: self,
					original: event
				});				
			}, 50);			
	    });
    }
}

class PCheckInput extends PInputField {

	constructor($node) {
	    super($node);
	    var self = this;
	}
	initFieldNode() {
	    this.fieldNode = this.node.find("input").addBack('input');
	}
    getValue() {
        return this.fieldNode.is(":checked");
    }
    setValue(value) {
        this.fieldNode.prop('checked', value);
    }
    bindChange() {
        var self = this;
	    self.fieldNode.bind("click", function(event) {
	        //event.preventDefault();
	        event.stopPropagation();
	        self.setAsValid();
            self.notifyObservers({
                name: "valueChanged",
                target: self,
                original: event
            });
	    });
    }
}
class PRadioInput extends PInputField {

	constructor($node) {
	    super($node);
	    var self = this;
	}
	initFieldNode() {
	}
    getValue() {
        return this.node.find("input:checked").attr("value");
    }
    setValue(value) {
        this.node.find("input").prop('checked', false);
        this.node.find("input[value="+value+"]").prop('checked', true);
    }
    setOptionEnabled(optionValue, enabled) {
        this.node.find("input[value="+optionValue+"]").prop('disabled', !enabled);
    }
    getEnabledOptions() {
        return this.node.find("input:not(:disabled)");
    }
    bindChange() {
        var self = this;
	    self.node.find("input").bind("click", function(event) {
	        //event.preventDefault();
	        event.stopPropagation();
	        self.setAsValid();
            self.notifyObservers({
                name: "valueChanged",
                target: self,
                original: event
            });
	    });
    }
}
class PSelect extends PInputField {

	constructor($node) {
	    super($node);
	    var self = this;
	}
	initFieldNode() {
	    this.fieldNode = this.node.find("select").addBack('select');
	}
    bindChange() {
        var self = this;
	    if (self.fieldNode) {
            self.fieldNode.bind("change", function(event) {
                self.setAsValid();
                self.notifyObservers({
                    name: "valueChanged",
                    target: self,
                    original: event
                });
            });
	    }
    }
    getValue() {
        return this.node.find("option:selected").attr("value");
    }
    setValue(value) {
        this.node.find("option").prop('selected', false);
        this.node.find("option[value="+value+"]").prop('selected', true);
    }
}