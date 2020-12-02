class RenderEngine {

    constructor() {
		Mustache.tags = [ '<<', '>>' ];
		this.templates = {};
    }	
	renderTemplate(templateName, data) {
		console.log("renderTemplate");
		var template = this.templates[templateName];
		if (!template) {
			console.log("load");
			template = $("#"+templateName).html().trim();
			this.templates[templateName] = template;
		}
		return Mustache.render(template, data);		
	}
}