var menu = null;
class menuSunburst {
    constructor(params) {
        this.titles = null;
        menu = this;
        var me = this;
        this.cont = d3.select("#"+params.idCont);
        this.width = params.width ? params.width : 400;
        this.callback = params.callback ? params.callback : null;
        if (!params.data)
            throw new Exception("no data for sunburst");
        this.data = params.data;
        var svgMenu, objEW, parent, root, color, g, path, label, checkboxes
        ,format = d3.format(",d")
        ,radius = this.width / 6
        ,arc = d3.arc()
                .startAngle(d => d.x0)
                .endAngle(d => d.x1)
                .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
                .padRadius(radius * 1.5)
                .innerRadius(d => d.y0 * radius)
                .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))
        , partition = data => {
            root = d3.hierarchy(data)
                    .sum(d => d.size)
                    .sort((a, b) => b.value - a.value);
            return d3.partition()
                    .size([2 * Math.PI, root.height + 1])
                    (root);
        };              

        this.init = function () {

            console.log(me.data);
            root = partition(me.data);
            color = d3.scaleOrdinal().range(d3.quantize(d3.interpolateRainbow, me.data.children.length + 1));
    
            root.each(d => d.current = d);

            //ajoute le svg du menu
            svgMenu = me.cont.append("svg")
                    .style("width", "96%")
                    .style("height", "96%")
                    .style("position","absolute")
                    .attr('viewBox',"0 0 "+me.width+" "+me.width)
                    .style("font", "5px sans-serif");
                    //.style("overflow-wrap", "break-word"); // does not work
    
            g = svgMenu.append("g")
                    .attr("transform", `translate(${me.width / 2},${me.width / 2})`);
    
            path = g.append("g")
                    .selectAll("path")
                    .data(root.descendants().slice(1))
                    .join("path")
                    .attr("fill", d => {
                        while (d.depth > 1)
                            { d = d.parent; }
                        return color(d.data.name);
                    })
                    .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 1 : 0.8) : 0)
                    .attr("d", d => arc(d.current));
    
            /*le click uniqument sur cases avec des enfants
            path.filter(d => d.children)
                    .style("cursor", "pointer")
                    .on("click", clicked);
            */
			path.style("cursor", "pointer")
				.on("click", clicked);

    
            path.append("title")
                .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);            
            
            parent = g.append("circle")
                    .datum(root)
                    .attr("r", radius)
                    .attr("fill", "none")
                    .attr("pointer-events", "all")
                    .on("click", clicked);
			
			g.append("circle")
				.attr("r", "10")
				.attr("stroke", "black")
				.attr("stroke-width", "0.5")
				.attr("fill", "white")
				.attr("class", "validation")
				.style("cursor", "pointer");

			g.append("text")
				.attr("dx", "-8")
				.attr("dy", "2")
				.style("cursor", "pointer")
				.text("Valider")
				.on("click", clickOnValidate);			
			
			var descendants = root.descendants().slice(1);
			
			var dataLabel = g.append("g")
                    //.attr("pointer-events", "none")
                    .attr("text-anchor", "middle")
                    .style("user-select", "none");
			
            label = dataLabel
                    .selectAll("text")
                    .data(descendants)
                    .join("text")
                    .attr("dy", "0.35em")
                    .attr("fill-opacity", d => +labelVisible(d.current))
                    .attr("transform", d => labelTransform(d.current))
                    .text(d => d.data.name);
            
			checkboxes = dataLabel
                    .selectAll("circle")
                    .data(descendants)
                    .join("circle")
                    .attr("cx", "0")
					.attr("cy", "0")
					.attr("r", "2")
					.attr("stroke", "black")
					.attr("stroke-width", "0.5")
					.attr("fill", "white")
					.attr("class", "checkbox")
					.style("cursor", "pointer")
					.attr("display", d => checkboxVisible(d.current))
                    .attr("transform", d => checkboxTransform(d.current))
					.on("click", clickedCB);
			
			//$("circle.checkbox").bind("click", function() {
			//	console.log("YO");
			//})
			
            wrap(label, 30);			


			//d3.selectAll("circle")
			//	.on("click", clickedCB);
           
        };

        this.hide = function(){
          svgMenu.attr('visibility',"hidden");
        }
        this.show = function(){
          svgMenu.attr('visibility',"visible");
          if(objEW)objEW.hide();
        }

        function fctExecute(p) {
            switch (p.data.fct) {
                case 'showRoueEmotions':
                  me.hide();
                  if(!objEW)
                    objEW = new emotionswheel({'idCont':me.cont.attr('id'),'width':me.width,'height':me.width});
                  else
                    objEW.show();
                  break;
                default:
                  console.log(p);
            }            
        }

		function wrap(text, width) {
		    text.each(function() {
				if (d3.select(this).text() == "Monde Marchand")
					console.log("XXX");		        
				var text = d3.select(this),
		            words = text.text().split(/\s+/).reverse(),
		            word,
		            line = [],
		            lineNumber = 1,
		            lineHeight = 1.1, // ems
		            y = text.attr("y"),
		            dy = parseFloat(text.attr("dy")),
		            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
				var firstSpan = tspan;
		        while (word = words.pop()) {
		            line.push(word);
		            tspan.text(line.join(" "));
		            if (tspan.node().getComputedTextLength() > width) {
		                if (line.length == 1) {
		                	tspan.text(line.join(" "));
		                	line = []
		                	if (words.length > 0) {
			                	tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", "1em");
			                	lineNumber++;
		                	}
		                } else {
			                line.pop();
			                tspan.text(line.join(" "));
			                line = [word];
			                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", "1em").text(word);
			                lineNumber++;
		                }
		            }					
		        }
		        firstSpan.attr("dy", (-0.5*(lineNumber-1)+0.25) + "em");
		    });
		}

        function clickedCB(p) {
			console.log(p);
			console.log($(this));
			var checkbox = d3.select(this);
			if (checkbox.attr("fill") == "white")
				checkbox.attr("fill", "grey");
			else
				checkbox.attr("fill", "white");
		}
        function clickOnValidate(p) {
			console.log("validate");
		}

        function clicked(p) {

            //vérifie si une fonction est définie
            if(p.data.fct)fctExecute(p);
            
            if (menu.callback) {
                menu.callback(p, $(this));
            }

            //si pas d'enfant on sort
            if (!p.children)
                return;
            //else { // void comment trouver l'élément dom
            //    p.path(g.transition()).style("color", "red");
            //}

            parent.datum(p.parent || root);

            root.each(d => d.target = {
                    x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                    x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                    y0: Math.max(0, d.y0 - p.depth),
                    y1: Math.max(0, d.y1 - p.depth)
                });

            const t = g.transition().duration(750);

            // Transition the data on all arcs, even the ones that aren’t visible,
            // so that if this transition is interrupted, entering arcs will start
            // the next transition from the desired position.
            path.transition(t)
                    .tween("data", d => {
                        const i = d3.interpolate(d.current, d.target);
                        return t => d.current = i(t);
                    })
                    .filter(function (d) {
                        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
                    })
                    .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 1 : 0.8) : 0)
                    .attrTween("d", d => () => arc(d.current));

            label.filter(function (d) {
                    return +this.getAttribute("fill-opacity") || labelVisible(d.target);
                }).transition(t)
                        .attr("fill-opacity", d => +labelVisible(d.target))
                        .attrTween("transform", d => () => labelTransform(d.current));
						
			checkboxes.filter(function (d) {
                    return +this.getAttribute("fill-opacity") || checkboxVisible(d.target);
                }).transition(t)
						.attr("display", d => checkboxVisible(d.target))
                        .attrTween("transform", d => () => checkboxTransform(d.current));
        }

        function arcVisible(d) {
            return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
        }

        function labelVisible(d) {
            return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
        }

        function labelTransform(d) {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2 * radius;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        }

        function checkboxVisible(d) {
            if (d.y1 <= 2 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03)
				return "inline";
			else
				return "none";
        }

        function checkboxTransform(d) {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2 * radius;
            return `rotate(${x - 90}) translate(${y-17},0) rotate(${x < 180 ? 0 : 180})`;
        }
        this.init();
    }
}

  
