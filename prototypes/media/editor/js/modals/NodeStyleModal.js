class NodeStyleModal {

    constructor(name, style) {
		var self = this;
		this.node = $("#"+name);
		this.openButton = $("button[data-target='#"+name+"']");
		this.nameInput = new PTextInput(this.node.find("[data-input-field=name]"));
		this.nameInput.addObserver(function(event) {
			self.updateRenderPanelText();
		});		
		self.cssFields = [];
		self.cssFields.push(new PColorChooser(this.node.find("[data-css-field=border-color]")));
		self.cssFields.push(new PColorChooser(this.node.find("[data-css-field=background-color]")));
		self.cssFields.push(new PColorChooser(this.node.find("[data-css-field=color]")));
		self.cssFields.push(new PPixelNumberInput(this.node.find("[data-css-field=border-width]")));
		self.cssFields.push(new PCheckButton(this.node.find("[data-css-field=font-weight]"), "bolder", "none"));
		self.cssFields.push(new PCheckButton(this.node.find("[data-css-field=font-style]"), "italic", "none"));
		$.each(self.cssFields, function(index, cssField) {
			cssField.addObserver(function(event) {
				var style = "";
				$.each(self.cssFields, function(index, cssField) {
					var value = cssField.getValue();
					if (value)
						style = style + cssField.node.data("css-field")+ ":" + value + ";";
				});
				self.updateRenderPanelStyle(style);
			});
		});
		self.node.find("button[action=save]").bind("click", function() {
			self.save();
			self.node.find("button[action=close]").click();
		});
    }
	find(arr, test, ctx) {
		var result = null;
		arr.some(function(el, i) {
			return test.call(ctx, el, i, arr) ? ((result = el), true) : false;
		});
		return result;
	}
	loadStyle() {
		var self = this;
		var styleTable = self.element.getStyleTable();
		$.each(styleTable, function(cssField, value) {
			cssField = self.find(self.cssFields, function(obj) {
				return obj.node.data("css-field") == cssField;
			});
			if (cssField)
				cssField.setValue(value);
		});
		self.updateRenderPanelStyle(self.element.getStyle());
	}
	updateRenderPanelStyle(style) {
		$(".nodeArchetype", this.node).attr("style", style);
	}
	updateRenderPanelText() {
		if (this.mode == "modifyArchetype")
			$(".nodeArchetype", this.node).text(this.nameInput.getValue());
		else
			$(".nodeArchetype", this.node).text(this.element.data.label);
	}
	save() {
		var self = this;
		var styleTable = {};
		$.each(self.cssFields, function(index, cssField) {
			styleTable[cssField.node.data("css-field")] = cssField.getValue();
		});
		if (this.element instanceof Archetype) {
			this.element.setName(this.nameInput.getValue());
			this.element.updateStyleTable(styleTable);
			$.each(this.element.instances, function(index, instance) {
				instance.renderNodeStyle();
			});
		} else {
			this.element.updateStyleTable(styleTable);
			this.element.renderNodeStyle();
		}			
	}
	open(element) {
		this.element = element;
		if (this.element instanceof Archetype) {
			this.mode = "modifyArchetype";
			this.nameInput.node.removeClass("hidden");
			this.nameInput.setValue(element.data.name);
		} else {
			this.mode = "modifyInstance";
			this.nameInput.node.addClass("hidden");
		}
		this.updateRenderPanelText();
		this.loadStyle();		
		this.openButton.click();
	}
}