class Proto {

    constructor(useCorsProxy) {
		this.useLocal = false;
		this.useCorsProxy = useCorsProxy;
		this.geo = new Geo();
		this.geo.getPosition(function(coords) {}); // just for ask the user for its approval when starting the app
        this.resultData = {
            resource : null,
            property : null,
            user : null,
            geoLoc : null,
            date : null
        }
        this.circularMenuData = null;
    }
    getSyncJson(url) {
		if (this.useCorsProxy && !url.startsWith("http://127.0.0.1:8000"))
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
    getInformationUrl() {
        if (this.useLocal)
            return "http://127.0.0.1:8000/media_site/data/donnees.json";
        else
            return "https://polemika.univ-paris8.fr/omk/api/items?item_set_id=2";
    }
    getMenuUrl() {
        if (this.useLocal)
            return "http://127.0.0.1:8000/media_site/data/dataMenuCirculaire.json";
        else
            return "https://polemika.univ-paris8.fr/omk/api/items?resource_class_id=133";
    }
    getOneInformation() {
        var self = this;
		var url = this.getInformationUrl();
		//var url = "https://polemika.univ-paris8.fr/omk/api/items?item_set_id=2";
		var informations = self.getSyncJson(url);
		//$.getJSON(url, function(informations) {
		var randomIndex = Math.floor(Math.random() * (informations.length-1));
		var information = informations[randomIndex];
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
						imgUrl: null,							
					}
					var mediaUrl = node["o:media"][0]["@id"];
					var media = self.getSyncJson(mediaUrl);
					information.imgUrl = media["o:source"];
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
    		var url = this.getMenuUrl()
    		$.getJSON(url, function(object) {
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
    								size:1
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
            // TODO serialize as web annotation
            callback(self.resultData);
        });    
    }
    sendResult() {
        console.log("SEND DATA");
        console.log(self.resultData);        
        // TODO send to server
    }
}