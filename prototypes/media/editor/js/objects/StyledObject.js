class StyledObject {

    constructor(data, diagram) {
		this.data = data;
		this.diagram = diagram;
    }
	getStyle() {
		return this.data.cssStyle;
	}
	getStyleTable() {
		return this.styleTable;
	}
	updateStyleTable(styleTable) {
		Object.assign(this.styleTable, styleTable);
		var oldCssStyle = this.data.cssStyle;
		this.computeStyle();
		if (this.data.cssStyle != oldCssStyle)
			this.diagram.model.notifyChange(this.data);
	}
	computeStyleTable(cssStyle) {
		if (cssStyle) {
			var self = this;
			self.styleTable = {};		
			$.each(cssStyle.split(";"), function(index, value) {
				value = value.trim();
				if (value) {
					value = value.split(":");
					var cssField = value[0].trim();
					self.styleTable[value[0].trim()] = value[1].trim();
				}
			});
		}
	}
	computeStyle() {
		var styleTable = [];
		$.each(this.styleTable, function(cssField, value) {
			styleTable.push(cssField+":"+value);
		});
		this.data.cssStyle = styleTable.join(";");
	}	
}