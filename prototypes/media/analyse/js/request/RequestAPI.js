class RequestAPI extends ProtoAPI {

    constructor(proto) {
        super(proto);
        this.useLocalData = true;
        this.resourceTemplates = {
            descriptionMonde: {
                id: 5,
                name: "DescMonde",
                fields: null,
                field2Value: {}
            },
            ps: {
                id: 38,
                name: "PS",
                fields: null,
                field2Value: {}
            },
            sonar: {
                id: 39,
                name: "Sonar",
                fields: null,
                field2Value: {}
            },
            emotion: {
                id: 44,
                name: "Emotion",
                fields: null,
                field2Value: {}
            },
            item: {
                id: 46,
                name: "Item",
                fields: null,
                field2Value: {}
            }
        };
	}
    getResourceTemplates() {
        return this.resourceTemplates;
    }
    getResourceTemplate(rtId) {
        return _.find(this.getResourceTemplates(), function(rt) { return rt.id == rtId });
    }
    getRTFields(resourceTemplate, callback) {
        var result = resourceTemplate.fields;
        if (result != null) {
            callback(result);
        } else {
            var url = 'https://polemika.univ-paris8.fr/omk/s/api/page/ajax?type=querySql&action=statResourceTemplate&id='+resourceTemplate.id;
            if (this.useLocalData)
                url = '/media/analyse/data/fields-39.json';
			this.getJSON(
			    url,
			    function(data) {
					//data = jsonPath(data, "*.local_name");
					var result = [];
					$.each(data, function(key, value) {
					    result.push({
					        id: value.pId,
					        name: value.local_name
					    });
					})
					console.log("load getRTFields", resourceTemplate.name);
					console.log(result);
					resourceTemplate.fields = result;
					callback(result);
			    }
			);
        }
    }
    getRTField(resourceTemplate, fieldId, callback) {
        this.getRTFields(resourceTemplate, function(fields) {
            callback(_.find(fields, function(field) { return field.id == fieldId }));
        });
    }
    getRTFieldValues(resourceTemplate, field, callback) {
        var result = resourceTemplate.field2Value[field.id];
        if (result != null) {
            callback(result);
        } else {
            var url = 'https://polemika.univ-paris8.fr/omk/s/api/page/ajax?type=querySql&action=getDistinctPropertyVal&idP='+field.id+'&idRT='+resourceTemplate.id;
            if (this.useLocalData)
                url = '/media/analyse/data/fieldValues.json';
			this.getJSON(
			    url,
			    function(data) {
					data = jsonPath(data, "*.title");
					data = _.filter(data, function(obj) { return obj != null });
					resourceTemplate.field2Value[field.id] = data;
					console.log("load getRTFieldValues", resourceTemplate.name, field.name);
					console.log(data);
					callback(data);
			    }
			);
        }
    }
}