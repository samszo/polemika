class EditorLayout {

    constructor($node, mode) {
		var self = this;
		self.mode = mode;
		self.pstyle = 'background-color: #F5F6F7; border: 1px solid #dfdfdf; padding: 5px;';
		self.computeVisiblePanels(mode);
		
		self.wLayout = $node.w2layout({
			name: 'layout',
			panels: self.panels
		});
		
		self.container = $(".polemika-editor-instance-container").children().eq(0);
		self.container.children().bind("click", function() {
			self.container.children().removeClass("selected");
			$(this).addClass("selected");
		});
		
		if (self.visiblePanels) {			
			var $visiblePanel = $(self.wLayout.el(self.visiblePanels[0])).closest(".w2ui-panel");
			$visiblePanel.addClass("selected");
		}
	}
	getSelectedPanel() {
		return this.container.find(".w2ui-panel.selected");
	}
	getPanel(name) {
		var self = this;
		return $(self.wLayout.el(name)).closest(".w2ui-panel");
	}
	computeVisiblePanels(mode) {
		var self = this;
		self.panels = [
			{ type: 'top',  size: "50%", resizable: true, style: self.pstyle, content: 'top', hidden:true },
			{ type: 'left', size: "50%", resizable: true, style: self.pstyle, content: 'left', hidden:true },
			{ type: 'main', style: self.pstyle, content: 'main', hidden:false },
			{ type: 'preview', size: '50%', resizable: true, style: self.pstyle, content: 'preview', hidden:true },
			{ type: 'right', size: 200, resizable: true, style: self.pstyle, content: 'right', hidden:true },
			{ type: 'bottom', size: "50%", resizable: true, style: self.pstyle, content: 'bottom', hidden:false }
		];		
		self.visiblePanels = [];
		if (mode == "full") {
			self.panels[0].hidden = true;
			self.panels[1].hidden = true;
			self.panels[2].hidden = false;
			self.panels[3].hidden = true;
			self.panels[4].hidden = true;
			self.panels[5].hidden = true;
			self.visiblePanels = ["main"];
		} else if (mode == "split-v") {
			self.panels[0].hidden = true;
			self.panels[1].hidden = true;
			self.panels[2].hidden = false;
			self.panels[3].hidden = true;
			self.panels[4].hidden = true;
			self.panels[5].hidden = false;
			self.visiblePanels = ["main", "bottom"];
		} else if (mode == "split-h") {
			self.panels[0].hidden = true;
			self.panels[1].hidden = false;
			self.panels[2].hidden = false;
			self.panels[3].hidden = true;
			self.panels[4].hidden = true;
			self.panels[5].hidden = true;
			self.visiblePanels = ["left", "main"];
		}
		//self.visiblePanels = self.panels.map(x => x.type);
	}
	togglePanel(name, show) {
		if (show)
			this.wLayout.show(name, true);
		else
			this.wLayout.hide(name, true);
	}
	changeMode(mode) {
		var self = this;
		var currentPanels = self.panels
		self.computeVisiblePanels(mode);
		$.each(self.panels, function(index, newPanel) {
			var oldPanel = currentPanels[index];
			if (newPanel.hidden != oldPanel.hidden)
				self.togglePanel(newPanel.type, !newPanel.hidden);
		});
		self.mode = mode;
	}
}