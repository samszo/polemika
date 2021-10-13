class ProtoAPI {

    constructor(proto) {
        this.proto = proto;
        this.useProxy = proto.useLocal;
        this.useLocalData = proto.useLocalData;
	}
	getJSON(url, callback) {
	    var localCall = url.startsWith("http://127.0.0.1:5000");
	    if (!localCall && this.useProxy) {
            $.getJSON(
                'http://127.0.0.1:5000/proxy',
                {
                    url: url,
                },
                function(data) {
                    data = JSON.parse(data.result);
                    callback(data);
                }
            );
	    } else {
			$.ajax({
				url: url,
				dataType: "json",
				success: function (data) {
					callback(data);
				}
			});
	    }
	}
	/*
	test() {
        this.getJSON(
            'https://polemika.univ-paris8.fr/omk/s/api/page/ajax?type=diagramme&action=getDiagrammes',
            function(data) {
                console.log(data);
            }
        );
        this.getJSON(
            'http://127.0.0.1:5000/media/analyse/data/fields-39.json',
            function(data) {
                console.log(data);
            }
        );
	}
	*/
}