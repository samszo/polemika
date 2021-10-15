class ProtoAPI {

    constructor(proto) {
        this.proto = proto;
	}
	getJSON(url, callback) {
	    if (url.startsWith("/"))
	        url = this.proto.getRootUrl() + url;
        $.getJSON(
            '/proxy',
            {
                url: url,
            },
            function(data) {
                data = JSON.parse(data.result);
                callback(data);
            }
        );
	    /*
	    else {
			$.ajax({
				url: url,
				dataType: "json",
				success: function (data) {
					callback(data);
				}
			});
	    }
	    */
	}
}