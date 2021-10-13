class PredicateRequest extends RequestElement {

    constructor($node, engine, data) {
		super($node, engine);
		var self = this;
		var remover = this.engine.builder.createRequestRemoverButton();
		$node.append(remover.node);
		remover.addObserver(function(event) {
			var element = remover.node.closest(".request-element").data("dom-object");
			element.getParent().remove(element);
			//console.log(event);
			//remover.node.closest(".request-element").remove();
		});

        this.rtSelect = new PSelect($(".rt-select", this.node));
        this.rtFieldSelect = new PSelect($(".rt-field-select", this.node));
        this.selectOperator = new PSelect($(".value-search-operator", this.node));
        this.valueInput = new PACField($(".value-input", this.node));
        if (data != null) {
            this.selectOperator.setValue(data.operator);
            this.valueInput.setValue(data.value);
        }
        /*this.valueInput.addObserver(function() {
            console.log("value input change", self.valueInput.getValue());
        });*/
        this.updateRTOptions(data);
        this.rtSelect.addObserver(function() {
            console.log("change rt", self.rtSelect.getValue());
            self.selectedRT = self.engine.api.getResourceTemplate(self.rtSelect.getValue());
            self.updateFieldOptions();
        });
        this.rtFieldSelect.addObserver(function() {
            console.log("change field", self.rtFieldSelect.getValue());
            self.engine.api.getRTField(self.selectedRT, self.rtFieldSelect.getValue(), function(field) {
                self.selectedRTField = field;
                self.updateFieldValues();
            });
        });
    }
    updateRTOptions(data) {
		var self = this;
		this.rtSelect.node.empty();
		this.selectedRT = null;
		$.each(this.engine.api.getResourceTemplates(), function(index, resourceTemplate) {
		    if (data == null && self.selectedRT == null)
		        self.selectedRT = resourceTemplate;
		    else if (data != null && data.resourceTemplateId == resourceTemplate.id)
		        self.selectedRT = resourceTemplate;
		    var $option = $('<option value="'+resourceTemplate.id+'" '+(self.selectedRT == resourceTemplate ? ' selected' : '')+'>'+resourceTemplate.name+'</option>');
		    self.rtSelect.node.append($option);
		});
        this.updateFieldOptions(data);
    }
    updateFieldOptions(data) {
        var self = this;
        this.rtFieldSelect.node.empty();
        if (self.selectedRT) {
            this.engine.api.getRTFields(this.selectedRT, function(fields) {
                self.selectedRTField = null;
                $.each(fields, function(index, field) {
                    if (data == null && self.selectedRTField == null)
                        self.selectedRTField = field;
                    else if (data != null && data.property.id == field.id)
                        self.selectedRTField = field;
                    var $option = $('<option value="'+field.id+'" '+(self.selectedRTField == field ? 'selected' : '')+'>'+field.name+'</option>');
                    self.rtFieldSelect.node.append($option);
                });
                self.updateFieldValues();
            });
        } else
            self.updateFieldValues();
    }
    updateFieldValues() {
        var self = this;
        if (self.selectedRT && self.selectedRTField) {
            self.engine.api.getRTFieldValues(self.selectedRT, self.selectedRTField, function(fieldValues) {
                self.valueInput.setACValues(fieldValues);
            });
        }
    }
	serialize() {
		return {
			type: "Predicate",
			operator: this.selectOperator.getValue(),
			resourceTemplateId: this.selectedRT.id,
			property: this.selectedRTField,
			value: this.valueInput.getValue()
		};
	}
}