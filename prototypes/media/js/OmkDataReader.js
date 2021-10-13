class OmkDataReader {

    constructor(proto) {
		this.proto = proto;
		this.itemsQuery = [{
			texte : "o:title",
			/*media : {
				_ : "o:media",
				imgUrl : "o:thumbnail_urls"
			},*/
			media : "thumbnail_display_urls",
			sujet : "dcterms:subject",
			date : "dcterms:date"
		}];
    }	
	read(node, query, deferreds) {
		var self = this;
		var result = null;
		if (Array.isArray(node)) {
			result = [];
			var subQuery = query[0];
			$.each(node, function(index, value) {
				result.push(self.read(value, subQuery, deferreds));
			});
		} else {
			var type = node["@type"];
			var id = node["o:id"]
			result = {
				_meta : {
					id : node["o:id"],
					type : node["@type"]
				}
			}
			$.each(query, function(key, value) {
				if (typeof(value) == "object") {
					try {
						var child = node[value["_"]][0];
						var url = self.proto.resolveAPIUrl(child["@id"]);
						var deferred = self.proto.getJSON(url, function(childData) {
							result[key] = self.read(childData, query[key], deferreds);
						})
						deferreds.push(deferred);
					} catch (exception) {
						result[key] = null;
					}
				} else if (Array.isArray(value)) {
					console.log("TODO");
				} else if (key != "_") {
					try {
						if (value.startsWith("dcterms:"))
							result[key] = node[value][0]["@value"];
						else
							result[key] = node[value];
					} catch (exception) {
						result[key] = null;
					}
				}
			})			
		}
		return result;
	}
	process(node, query, callback) {
		var deferreds = [];
		var result = this.read(node, query, deferreds);
		$.when.apply($, deferreds).then(function() {
			callback(result);
		});
	}
	process2(information, query) {
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
}