class Tabs extends PObject {
	constructor($node) {
	    super($node);
        this.name = this.node.uniqueId().attr("id");
        var self = this;
        var tabs = [];
        this.node.children(".tab").each(function(index, value) {
            var $tab = $(value);
            tabs.push({
                id: $tab.uniqueId().attr("id"),
                text: $tab.attr("tab-name"),
                disabled: $tab.attr("tab-disabled") != null
            });
        });
        this.currentTab = tabs[0].id;
        var config = {
            tabs: {
                name: this.name,
                active: 'tab1',
                tabs: tabs,
                onClick: function (event) {
                    self.show(event.target);
                }
            }
        }
        $('#tabs', this.node).w2tabs(config.tabs);
        this.node.children(".tab").first().removeClass("hidden");
	}
	show(tabId) {
        w2ui[this.name].active = tabId;
        w2ui[this.name].refresh();
        $('.tab', this.node).addClass("hidden");
        $('#' + tabId, self.node).removeClass("hidden");
        this.currentTab = tabId
        this.notifyObservers({ name : "change" });
	}
	enable(tabId) {
	    w2ui[this.name].enable(tabId);
	}
    disable(tabId) {
	    w2ui[this.name].disable(tabId);
	}
}