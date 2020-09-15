class Proto {

    constructor(useLocal) {
		this.useLocal = useLocal ? useLocal : false;
		this.useCorsProxy = this.useLocal;
		this.geo = new Geo();
		this.geo.getPosition(function(coords) {}); // just for ask the user for its approval when starting the app
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
        this.circularMenuData = null;
    }
    getGetParameters() {
        var search = location.search.substring(1);
        if (search)
            return JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');    
        else
            return {};
    }
    getSyncJson(url) {
		if (this.useCorsProxy && !url.startsWith("http://127.0.0.1:5000"))
		    url = "https://cors-anywhere.herokuapp.com/"+url;
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
	getInformationsData() {
        var url = null;
		if (this.useLocal)
            url = "http://127.0.0.1:5000/media/data/dataLocalInformations.json";
        else
            url = "http://polemika.univ-paris8.fr/omk/api/items?item_set_id=2";
		var informations = this.getSyncJson(url);
		return informations;
	}
	getOneInformationData(infoId) {
		var informations = this.getInformationsData();
		//$.getJSON(url, function(informations) {
		var information = null;
		if (this.useLocal) {
			information = informations[0];
		} else {
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
		}
		return information;
	}
    getMenuData(callback) {
        var url = null;
		if (this.useLocal)
            url = "http://127.0.0.1:5000/media/data/dataMenuCirculaire.json";
        else
            url = "http://polemika.univ-paris8.fr/omk/api/items?resource_class_id=133";
		$.getJSON(url, callback);
    }
	getMediaData(mediaUrl) {
		if (this.useLocal)
            mediaUrl = "http://127.0.0.1:5000/media/data/dataLocalMedia.json";
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
						imgUrl: mediaData["o:source"],
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
    getOneInformation(infoId) {
        var self = this;
		var information = self.getOneInformationData(infoId);
		return this.readInformation(information);
    }
    getCircularMenuData(callback) {
        if (this.circularMenuData)
            callback(this.circularMenuData);
        else {
    		this.getMenuData(function(object) {
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
    getResult() {
        return this.resultData;
    }
    serializeResult(callback) {
        var self = this;
        self.geo.getPosition(function(coords) {
            self.resultData.geoLoc = coords;
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
                'ma:locationLatitude' : coords.latitude,
                'ma:locationLongitude' : coords.longitude,
                'oa:hasSource' : [{
                    'type':'resource',
                    'value':self.resultData.resource
                }],
                'TD:property' : self.resultData.property,
                'TD:user' : "TODO",
                'TD:info' : self.resultData.info.omkId
            }            
            callback(omkData);
        });    
    }
    sendResult() {
        console.log("SEND DATA");
        console.log(self.resultData);        
        // TODO send to server
    }
	selectInfo($info, value) {				
		if ($info.hasClass("infoText")) {
			this.getResult().resource.type = "picture";
		} else {
			this.getResult().resource.type = 'text';
			this.getResult().resource.value = value;
		}
		$(".result").text("");
		$(".boutonQualifier").removeClass("hidden");
		$(".infoElt").removeClass("selected");
		$info.addClass("selected");
	}
	deselectInfo() {				
		$(".boutonQualifier").addClass("hidden");
		$(".infoElt").removeClass("selected");
	}
}