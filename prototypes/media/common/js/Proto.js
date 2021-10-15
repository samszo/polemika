class Proto {

    constructor() {		
		this.useLocalData = true; // if true, use local data when useful
		this.useLocalData = false;
		this.useLocal = window.location.origin.indexOf("127.0.0.1") > -1;
		this.useProxy = this.useLocal;
		this.APIBaseUrl = "https://polemika.univ-paris8.fr/omk";
		this.useCorsProxy = this.useLocal;
    }
    getRootUrl() {
        return "http://127.0.0.1:5000";
        //return "http://polemika.amo-it-proto.com"
        //return "https://polemika.univ-paris8.fr"
    }
    getGetParameters() {
        var search = location.search.substring(1);
        if (search)
            return JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');    
        else
            return {};
    }
    getJson(url, callback) {
		return $.ajax({
		    type: 'GET',
		    url: url,
		    dataType: 'json',
		    success: function(object) {
		    	callback(object);
		    },
		    data: {}
		});
    }
    getSyncJson(url) {
		//if (this.useCorsProxy && !url.startsWith("http://127.0.0.1:5000"))
		//    url = "https://cors-anywhere.herokuapp.com/"+url;
		var result = null;
		$.ajax({
		    type: 'GET',
		    url: url,
		    dataType: 'json',
		    success: function(object) {
		    	result = object;
		    },
		    data: {},
		    async: false
		});
		return result;
    }
	getItemsData(params, callback) {
		var url = "../omk/api/items?item_set_id=2";
		if (params) {
			$.each(params, function(index, value) {
				if (value != null)
					url+="&"+value;
			});			
		}
		url = this.resolveAPIUrl(url);
		this.getJson(url, callback);
	}
    getOneInformation(infoId, callback) {
		var self = this;
		this.getOneInformationData(null, function(information) {
			callback(self.readInformation(information));
		});
    }	
	getOneInformationData(infoId, callback) {		
		this.getItemsData(null, function(informations) {
			var information = null;
			if (infoId == null) {
				var randomIndex = Math.floor(Math.random() * (informations.length-1));
				information = informations[randomIndex];
			} else {
				$.each(informations, function(index, value) {
					if (value["o:id"] == infoId) {
						information = value;
						return false;
					}
				});
			}
			callback(information);
		});
	}
	resolveAPIUrl(relativeUrl) {
		if (this.useLocal && relativeUrl.indexOf("../") == 0) {
			var apiUrl = this.APIBaseUrl;
			var shifts = 0
			while (relativeUrl.indexOf("../") == 0) {
				relativeUrl = relativeUrl.substring(3);
				shifts++;
			}
			if (shifts) {
				var tab = apiUrl.split("/");
				tab.splice(tab.length - shifts, shifts);
				apiUrl = tab.join("/")+"/";
			}
			return apiUrl + relativeUrl;
		} else
			return relativeUrl;
	}
	getMediaData(mediaUrl) {
        var mediaUrl = this.resolveAPIUrl(mediaUrl);
		return this.getSyncJson(mediaUrl);
	}	
	readInformation(information) {
		var self = this;
		var data = [];
		var currentSet = data;
		var read = function(node) {
			if (Array.isArray(node)) {
				$.each(node, function(index, value) {
					read(value);
				});
			} else {
				var type = node["@type"];
				if (type && type.includes("o:Item")) { // Item
					var information = {
						texte : node["o:title"],
						omkId : {
						    id : node["o:id"],
						    type : type
						},
						media: null,
					}
					var mediaUrl = node["o:media"][0]["@id"];
					var mediaData = self.getMediaData(mediaUrl);					
					var media = {
						imgUrl: mediaData["o:thumbnail_urls"].large,//mediaData["o:source"],
						omkId : {
						    id : mediaData["o:id"],
						    type : mediaData["@type"]
						}
					}
					information.media = media
					currentSet.push(information);
				}
			}
		}
		read(information);
		var info = data[0]    
        return info;		
	}
    getCircularMenuData(callback) {
        if (this.circularMenuData)
            callback(this.circularMenuData);
        else {
			$.getJSON(this.resolveAPIUrl("../omk/api/items?resource_class_id=133"), function(object) {
    			var data = {
    				name: 'menu',
    				color: 'magenta',
    				children: [
    				]
    			};
    			var currentSet = data.children;
    			var read = function(node) {
    				if (Array.isArray(node)) {
    					$.each(node, function(index, value) {
    						read(value);
    					});
    				} else {
    					var type = node["@type"];
    					if (type && type.includes("o:Item") && type.includes("plmk:Monde")) { // world
    						var world = {
    							name : node["dcterms:title"][0]["@value"],
    							color: 'red',
        						omkId : {
        						    id : node["o:id"],
        						    type : type
        						},
    							children: [
    							]
    						}
    						currentSet.push(world);
    						var oldSet = currentSet;
    						currentSet = world.children;
    						$.each(node, function(key, value) {
    							if (key.startsWith("plmk:")) {
    								if (value.length > 0) {
    									var property = {
    										name : value[0]["property_label"],
    										color: 'orange',
                    						omkId : {
                    						    id : value[0]["property_id"],
                    						    type : value[0]["type"]
                    						},
    										children: [
    										]
    									}
    									currentSet.push(property);
    									var oldSet = currentSet;
    									currentSet = property.children;
    									read(value);									
    									currentSet = oldSet;
    								}
    							}
    						});
    						currentSet = oldSet;
    					} else {
    						var type = node["type"];
    						
    						if (type && type == "resource") {
    							var propertyValue = {
    								name : node["display_title"],
    								color: 'blue',
    								size:1,
            						omkId : {
            						    id : node["value_resource_id"],
            						    type : node["value_resource_name"]
            						}    								
    							}
    							currentSet.push(propertyValue);
    						}
    					}
    				}
    			}
    			read(object);
    			this.circularMenuData = data;
    			callback(data);
    		});
        }
    }
}