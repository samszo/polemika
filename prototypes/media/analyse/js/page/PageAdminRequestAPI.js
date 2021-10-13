class PageAdminRequestAPI extends ProtoAPI {

    constructor(proto) {
        super(proto);
	}
    search(request, pagination, filters, callback) {
		var params = [];
		params.push("page="+pagination);
		var propIndex = 0;
		/*if (filters.subject) {
			Array.prototype.push.apply(params, ["property["+propIndex+"][joiner]=and", "property["+propIndex+"][property]=3", "property["+propIndex+"][type]=eq", "property["+propIndex+"][text]="+filters.subject]);
			propIndex++;
		}
		if (filters.title) {
			Array.prototype.push.apply(params, ["property["+propIndex+"][joiner]=and", "property["+propIndex+"][property]=1", "property["+propIndex+"][type]=in", "property["+propIndex+"][text]="+filters.title]);
			propIndex++;
		}*/
		if (filters.sortBy)
			params.push("sort_by="+filters.sortBy);
		if (filters.sortOrder)
			params.push("sort_order="+filters.sortOrder);

        var url = 'https://polemika.univ-paris8.fr/omk/api/items?item_set_id=2';
        $.each(params, function(index, value) {
            if (value != null)
                url+="&"+value;
        });
        this.getJSON(
            url,
            function(data) {
                callback(data);
            }
        );
    }
}