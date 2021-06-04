class PageAdminQualification extends Proto {

    constructor() {
		super();
		var self = this;
		self.waitingMode(true);
		this.loadSession();
		this.modal = null;
		this.geo = new Geo();
		this.geo.getPosition(function(coords) {}); // just for ask the user for its approval when starting the app
		this.engine = new RenderEngine(); // engine for front-end html templates rendering
		this.initQualificationResult();
		this.initMenu();
		this.currentItemList = $(".list-result."+self.session.itemViewKind);
		this.currentItemList.removeClass("hidden")
		this.loadedItems = [];
		
		//var params = proto.getGetParameters();
		this.filters = {
			page:1
		}
		// init menu
		var $subjectList = $(".omk-db-subjects");
		$.each(self.gotDbSubjects(), function(index, value) {
			$subjectList.append('<a class="dropdown-item font-regular size-small color-darkgrey" href="#" data-subject="'+value+'">'+value+'</a>');
		});
		$.each($subjectList.find('a'), function(index, value) {
			$(value).bind("click", function() {
				self.setSubjectFilter($(value).data("subject"));
				self.saveSession();
				self.resetItems();
				self.loadItems();
			});
		});
		self.setSubjectFilter(this.session.filters.subject);
		$(".titleSearchButton").unbind("click").bind("click", function() {			
			self.setTitleFilter($(".omk-db-title-chooser").val());
			self.saveSession();
			self.resetItems();
			self.loadItems();
		});
		self.setTitleFilter(this.session.filters.title);
		$(".omk-db-title-chooser").bind("keypress keyup", function(event) {
			event.stopPropagation();
			if (event.keyCode == 13) {
				self.setTitleFilter($(".omk-db-title-chooser").val());
				self.saveSession();
				self.resetItems();
				self.loadItems();
			} else
				self.toggleDeleteTitleFilter($(this).val().trim().length > 0);
		});
		$(".removeTitleSearchButton").bind("click", function() {
			self.setTitleFilter("");
			self.saveSession();
			self.resetItems();
			self.loadItems();
		});		
		$.each($(".omk-sort-list a"), function(index, value) {
			$(value).bind("click", function() {
				self.setSortKind($(value).data("sort_by"), $(value).data("sort_oder"));
				self.saveSession();
				self.resetItems();
				self.loadItems();
			});
		});
		self.setSortKind(this.session.filters.sortBy, this.session.filters.sortOrder);
		
		// init items
		self.loadItems();
		self.initInfiniteScroll();
    }
	setSubjectFilter(subject) {
		this.session.filters.subject = subject;
		var text = $(".omk-db-subjects a[data-subject='"+subject+"']").text();
		$(".omk-db-subjects-chooser").find(".label").text(text);
	}
	setTitleFilter(title) {
		title = title.trim();
		this.session.filters.title = title;
		$(".omk-db-title-chooser").val(title);
		this.toggleDeleteTitleFilter(title != null && title.length > 0);
	}
	toggleDeleteTitleFilter(isVisible) {
		if (isVisible)
			$(".removeTitleSearchButton").removeClass("hidden");
		else
			$(".removeTitleSearchButton").addClass("hidden");		
	}
	setSortKind(sortBy, sortOrder) {
		this.session.filters.sortBy = sortBy;
		this.session.filters.sortOrder = sortOrder;
		var text = $(".omk-sort-list a[data-sort_by='"+sortBy+"'][data-sort_oder='"+sortOrder+"']").text();
		$(".omk-sort-chooser").text(text);
	}
	gotDbSubjects() {
		if (this.dBSubjects == null) {
			// todo get from server used dublin core subjects
			this.dBSubjects = ["culture", "economie", "people", "hi-tech", "monde-libre", "politique", "sciences"];
		}
		return this.dBSubjects;
	}
	loadSession() {
		this.session = localStorage.getItem("polemika-qualif");
		if (this.session == null) {
			this.session = {
				itemViewKind : "simple-view",
				filters : {
					subject : "",
					title : "",
					sortBy : "created",
					sortOrder : "desc"
				}
			}
			this.saveSession();
		} else
			this.session = JSON.parse(this.session);
	}	
	saveSession() {
		localStorage.setItem("polemika-qualif", JSON.stringify(this.session));
	}
	loadItemsData(filters, callback) {
		var self = this;
		self.getItemsData(filters, function(data) {
			self.reader.process(data, self.reader.itemsQuery, function(items) {
				callback(items);
			});
		});
	}
	loadItems() {
		var self = this;
		self.waitingMode(true);
		self.loadItemsData(self.computeLoadParams(), function(items) {
			Array.prototype.push.apply(self.loadedItems, items);
			self.renderItems(items, self.session.itemViewKind, self.currentItemList);
			self.waitingMode(false);
			self.infiniteScrollOn = true;
			$(".buttonQualification").bind("click", function() {
				self.openMenu();
			});
		});
	}	
	resetItems() {
		this.infiniteScrollOn = false;
		$(".list-result").empty();
		this.loadedItems = [];
		this.filters.page = 1;
	}
	initInfiniteScroll() {
		var self = this;
		self.infiniteScrollOn = true;
		self.infiniteScrollTolerance = 1;
		// vérifie si c'est un iPhone, iPod ou iPad
		var deviceAgent = navigator.userAgent.toLowerCase();
		var agentID = deviceAgent.match(/(iphone|ipod|ipad)/);
		$(window).scroll(function() {
			// cette condition vaut true lorsque le visiteur atteint le bas de page
			// si c'est un iDevice, l'évènement est déclenché 150px avant le bas de page
			if (self.infiniteScrollOn) {
				var fixeCase = ($(window).scrollTop() + $(window).height())+self.infiniteScrollTolerance >= $(document).height();
				var otherCase = agentID && ($(window).scrollTop() + $(window).height()) + 150 + self.infiniteScrollTolerance > $(document).height();
				if(fixeCase || otherCase) {
					this.infiniteScrollOn = false;
					console.log("GO inifinite scroll");					
					self.filters.page += 1;
					self.loadItems();
				}
			}
		});
	}
	computeLoadParams() {
		var params = [];
		params.push("page="+this.filters.page);
		var propIndex = 0;
		if (this.session.filters.subject) {
			Array.prototype.push.apply(params, ["property["+propIndex+"][joiner]=and", "property["+propIndex+"][property]=3", "property["+propIndex+"][type]=eq", "property["+propIndex+"][text]="+this.session.filters.subject]);
			propIndex++;
		}			
		if (this.session.filters.title) {
			Array.prototype.push.apply(params, ["property["+propIndex+"][joiner]=and", "property["+propIndex+"][property]=1", "property["+propIndex+"][type]=in", "property["+propIndex+"][text]="+this.session.filters.title]);
			propIndex++;
		}
		if (this.session.filters.sortBy)
			params.push("sort_by="+this.session.filters.sortBy);
		if (this.session.filters.sortOrder)
			params.push("sort_order="+this.session.filters.sortOrder);
		return params;
	}
	waitingMode(waiting) {
		if (waiting)
			$(".page-load-status").removeClass("hide");
		else
			$(".page-load-status").addClass("hide");
	}
	renderItems(items, templateName, $currentItemList) {
		var self = this;
		$.each(items, function(index, itemData) {
			if ($currentItemList.children("[data-item-id="+itemData._meta.id+"]").length == 0) {
				var $item = self.engine.renderTemplate(templateName, itemData);
				$currentItemList.append($item);
			}
		});
	}
	initMenu() {
		var self = this;
		var $menu = $(".facets-menu-panels");
		var $menuLinks = $(".facets-menu-links [data-link]");
		$menuLinks.unbind("click").bind("click", function() {
			var $link = $(this);
			var linkName = $(this).data("link");
			var $panel = $menu.find(".facets-menu-panel."+linkName);
			if ($panel.hasClass("hide")) {
				$menuLinks.removeClass("pushed");
				$link.addClass("pushed");
				$menu.find(".facets-menu-panel").addClass("hide");
				$panel.removeClass("hide");
				$menu.removeClass("hide");
			} else {
				$menuLinks.removeClass("pushed");
				$menu.addClass("hide");
				$panel.addClass("hide");						
			}
		});
		$('.switch-view button[data-mode='+this.session.itemViewKind+'] i').removeClass("disabled");
		$('.switch-view button').bind("click", function() {
			var $button = $(this);
			if ($button.find("i").hasClass("disabled")) {
				$('.switch-view button i:not(.disabled)').addClass("disabled");
				$button.find("i").removeClass("disabled");
				var mode = $button.data("mode");
				self.switchView(mode);
			}
		});
	}
	switchView(itemViewKind) {
		var self = this;
		self.session.itemViewKind = itemViewKind;
		var oldCurrentItemList = self.currentItemList;
		self.currentItemList = $(".list-result."+self.session.itemViewKind);
		self.saveSession();
		self.renderItems(self.loadedItems, self.session.itemViewKind, self.currentItemList);
		oldCurrentItemList.addClass("hidden");
		self.currentItemList.removeClass("hidden");
	}
	initQualificationResult() {
        this.resultData = {
            resource : { 
                type : null, // 'picture' ou 'text'
                value : null // value of text if type == 'image'
            },
            property : [],
            user : null,
            geoLoc : null,
            date : null,
            info : null
        }
	}
    serializeResult(callback) {
        var self = this;
        self.geo.getPosition(function(coords) {
            self.resultData.geoLoc = coords;
            var latitude = null;
			var longitude = null;
			if (coords) {
				latitude = coords.latitude;
				longitude = coords.longitude;
			}
			var today = new Date();
            self.resultData.date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
            if (self.resultData.resource.type == 'picture')
                self.resultData.resource.omkId = self.resultData.info.media.omkId;
            else
                self.resultData.resource.omkId = self.resultData.info.omkId;
            // serialize as omk RDF
            var omkData = {
                'dcterms:title' : "TODO",
                'jdc:creationDate' : self.resultData.date,
                'ma:locationLatitude' : latitude,
                'ma:locationLongitude' : longitude,
                'oa:hasSource' : [{
                    'type':'resource',
                    'value':self.resultData.resource
                }],
                'TD:property' : self.resultData.property,
                'TD:user' : "TODO",
                'TD:info' : self.resultData.info,
				'TODO:selected' : self.resultData.selected
            }
            callback(omkData);
        });    
    }
    sendResult(omkData) {
        console.log("SEND DATA");
        // TODO send to server
    }
	selectInfo($info, value) {				
		if ($info.hasClass("infoText")) {
			this.resultData.resource.type = 'text';
			this.resultData.resource.value = value;
		} else {
			this.resultData.resource.type = 'picture';
			this.resultData.resource.value = '';
		}		
		$(".infoElt").removeClass("selected");
		$info.addClass("selected");
		//$(".boutonQualifier").removeClass("hidden");
		this.openMenu();
	}
	deselectInfo() {				
		//$(".boutonQualifier").addClass("hidden");
		$(".infoElt").removeClass("selected");
	}
	openMenu() {
		var self = this;
		var $dataviz = $("body #dataviz");
		if ($dataviz.length > 0)
			$dataviz.remove();
		$dataviz = $("<div id='dataviz'></div>");
		$("body").append($dataviz);
		self.getCircularMenuData(function(menuData) {
			$dataviz.empty();
			new MenuQualification({
				'idCont':"dataviz",
				'width':200,
				'data' : menuData,
				'callback' : function(selectedItems) {
					console.log("selectedItems");
					//$(".result").text(JSON.stringify(omkData, undefined, 4));
					var selected = [];
					$.each(selectedItems, function(index, itemData) {
						selected.push(itemData.data.omkId);
					});
					self.resultData.selected = selected;
					//$(".boutonQualifier").removeClass("hidden");
					self.serializeResult(function(omkData) {
						console.log("Send qualification to server ...");						
						console.log(JSON.stringify(omkData, undefined, 4));
						self.sendResult(omkData);
					});
					self.deselectInfo();
					self.closeMenu();
				}
			});
			self.modal = new McModal($dataviz, [
				{action : "cancel", callback : function(modalLock) {
					modalLock.resolve();
					$("body #content").removeClass("blur");
					self.deselectInfo();
				}}
			]);
			$("body #content").addClass("blur");
			self.modal.show();
		});
	}
	closeMenu() {
		this.modal.node.find("span.close").click();
	}
}