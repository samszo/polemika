class RenderEngine {

    constructor() {
		Mustache.tags = [ '<<', '>>' ];
		this.templates = {};
    }	
	renderTemplate(templateName, data) {
		var template = this.templates[templateName];
		if (!template) {
			template = $("[data-template="+templateName+"]").html().trim();
			this.templates[templateName] = template;
		}
		return Mustache.render(template, data);		
	}
}