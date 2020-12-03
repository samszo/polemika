class MenuQualification {

    constructor(id, menuData, changeCallback) {
		var self = this;
		self.changeCallback = changeCallback;
		var menuChange = function(p, $domElt) {
			if ($domElt.is("circle")) {
				self.changeCallback("rewind", p, $domElt);
			} else if (!p.children) {
				var initialColor = $domElt.css("fill");
				var redColor = "rgb(255, 0, 0)";
				$domElt.css("fill", redColor);
				var count = 1;
				var intervalId = setInterval(function() {
					if ($domElt.css("fill") == redColor)
						$domElt.css("fill", initialColor);
					else
						$domElt.css("fill", redColor);
					if (count++ === 5) {
						clearInterval(intervalId);
						self.changeCallback("select", p, $domElt);
					}
				}, 200);
			} else {
				self.changeCallback("forward", p, $domElt);				
			}
		};		
		var svgMenu = new menuSunburst({
			'idCont':id,
			'width':200,
			'data' : menuData,
			'callback' : menuChange
		});
    }	
}