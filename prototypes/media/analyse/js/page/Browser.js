class Browser {

    constructor() {}

	loadSession() {
		this.session = localStorage.getItem("polemika-qualif");
		if (this.session == null) {
			this.session = {
				itemViewKind : "simple-view",
				filters : {
					sortBy : "created",
					sortOrder : "desc"
				},
				request : null
			}
			this.saveSession();
		} else
			this.session = JSON.parse(this.session);
		return this.session;
	}
	saveSession() {
		localStorage.setItem("polemika-qualif", JSON.stringify(this.session));
	}
}