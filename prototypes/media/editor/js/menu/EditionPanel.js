class EditionPanel extends PSubject {

    constructor($node, editor) {
		super();
		var self = this;
		this.node = $node;
		this.editor = editor;
		this.node.data("object", this);
		this.container = this.node.find(".text-container");
		this.container.bind("click", function(event) {
			//console.log("focus on container");
			self.node.find(".panel-edition-fragment").last().data("object").focus();
		});		
		this.node.focusout(function() {			
			self.notifyObservers({ name : "focusOut" });
		});
		this.clear();
		//this.currentInput = this.container.find(".text-fragment").eq(0);
    }
	clear() {
		this.container.empty();
		var frag = this.createTextFragment();
		frag.focus();
	}
	focus() {
		var lastTextFrag = this.node.find(".panel-edition-fragment").last().data("object");
		lastTextFrag.focus();
		lastTextFrag.setCaretPosition(lastTextFrag.getValue().length);
	}
	createVariableFragment(previousFragment) {
		var fragment = new VariableFragment(this);
		fragment.node.insertAfter(previousFragment.node);
		return fragment;
	}
	createTextFragment(previousFragment) {
		var fragment = new TextFragment(this);
		if (previousFragment)
			fragment.node.insertAfter(previousFragment.node);
		else
			this.container.append(fragment.node);
		return fragment;
	}
	createVariable(currentTextFragment) {
		var variableFrag = this.createVariableFragment(currentTextFragment);
		var textFrag = this.createTextFragment(variableFrag);
		var pos = currentTextFragment.getCaretPosition();
		var value = currentTextFragment.getValue();
		//console.log(value.substring(0, pos), value.substring(pos));
		if (pos < value.length) {
			currentTextFragment.setValue(value.substring(0, pos));
			textFrag.setValue(value.substring(pos));
		}
		variableFrag.focus();
	}
	removeVariable(currentTextFragment) {
		var prevVariableFragment = currentTextFragment.node.prev().data("object");
		if (prevVariableFragment) {
			var value = currentTextFragment.getValue();		
			var prevTextFragment = prevVariableFragment.node.prev().data("object");
			currentTextFragment.node.remove();
			prevVariableFragment.node.remove();
			value = prevTextFragment.getValue() + value;
			prevTextFragment.setValue(value);
			prevTextFragment.focus();
			prevTextFragment.setCaretPosition(value.length);
		}
	}
	getValue() {
		var values = [];
		$.each(this.node.find(".panel-edition-fragment"), function(index, value) {
			var frag = $(value).data("object");
			if (frag.constructor.name == "VariableFragment")
				values.push("["+frag.getValue()+"]");
			else
				values.push(frag.getValue());
		});
		return values.join(" ");
	}
	setValue(value) {
		this.oldValue = value;
		var state = "string";
		this.clear();		
		var currentFragment = this.node.find(".panel-edition-fragment").first().data("object");
		var string = "";
		for (var i = 0; i < value.length; i++) {
			var c = value[i];
			if (state == "string" && c == "[") {
				if (string[string.length -1] == " ")
					string = string.substring(0, string.length -1);
				currentFragment.setValue(string)
				string = "";
				state = "variable";
				currentFragment = this.createVariableFragment(currentFragment);
			} else if (state == "variable" && c == "]") {
				currentFragment.setValue(string)
				string = "";				
				state = "string";
				currentFragment = this.createTextFragment(currentFragment);
			} else {
				if (!(state == "string" && string.length == 0 && c == " "))
					string = string + c;
			}
		}
		if (currentFragment.constructor.name == "VariableFragment")
			this.createTextFragment(currentFragment);
		else
			currentFragment.setValue(string);
	}
}
class EditionPanelFragment {
    
	constructor(editionPanel) {
		this.editionPanel = editionPanel;
    }
}
class TextFragment extends EditionPanelFragment {
    
	constructor(editionPanel) {
		super(editionPanel);
		this.node = $('<span class="panel-edition-fragment text-fragment" contenteditable="true"></span>');
		this.node.data("object", this);
		var self = this;
		this.node.bind("click", function(event) {
			event.stopPropagation();
			//console.log("focus on text");
		});
		this.node.bind("keydown", function(event) {
			//console.log("event", event.key);
			if (event.key == "[") {
				self.editionPanel.createVariable(self);
				return false;
			} else if (event.key == "Backspace") {
				if (self.getCaretPosition() == 0) {
					self.editionPanel.removeVariable(self);
					return false;
				}
					
			}
		});
    }
	focus() {
		this.node.focus();
	}
	getValue() {
		return this.node.text();
	}
	setValue(value) {
		return this.node.text(value);
	}
	getCaretPosition() {
		var caretPos = 0,
			editableDiv = this.node[0],
			sel, range;
		if (window.getSelection) {
			sel = window.getSelection();
			if (sel.rangeCount) {
				range = sel.getRangeAt(0);
				if (range.commonAncestorContainer.parentNode == editableDiv) {
					caretPos = range.endOffset;
				}
			}
		} else if (document.selection && document.selection.createRange) {
			range = document.selection.createRange();
			if (range.parentElement() == editableDiv) {
				var tempEl = document.createElement("span");
				editableDiv.insertBefore(tempEl, editableDiv.firstChild);
				var tempRange = range.duplicate();
				tempRange.moveToElementText(tempEl);
				tempRange.setEndPoint("EndToEnd", range);
				caretPos = tempRange.text.length;
			}
		}
		return caretPos;
	}
	setCaretPosition(position) {
		var el = this.node[0];
		var range = document.createRange();
		var sel = window.getSelection();
		range.setStart(el.childNodes[0], position)
		range.collapse(true)
		sel.removeAllRanges()
		sel.addRange(range)
	}
}
class VariableFragment extends EditionPanelFragment {
    
	constructor(editionPanel) {
		super(editionPanel);
		var self = this;
		this.node = $('<div class="panel-edition-fragment variable-fragment"><span class="symbol">[</span><select class="form-control"></select><span class="symbol">]</span></div>');
        var $select = this.node.find("select");
        this.editionPanel.editor.api.getConceptsDansCrible(function(concepts) {
            $.each(concepts, function(index, concept) {
                $select.append($('<option>'+concept+'</option>'));
            });
        });
		this.node.data("object", this);
		this.node.bind("click", function(event) {
			event.stopPropagation();
			//console.log("focus on select");
		});
    }
	focus() {
		this.node.find("select").focus();
	}
	getValue() {
		return this.node.find("select").val();
	}
	setValue(value) {
		this.node.find("select").val(value);
	}
}
/* function test() {
	var panel = $(".panel-edition").data("object");
	var value = panel.getValue();
	console.log("value : " + value);
	panel.setValue(value);
} */