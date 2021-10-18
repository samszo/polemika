class Diagram_argument_force extends Diagram {

    constructor(params) {
        super(params);
		this.model = new DiagramModel_force();
		this.layout = new Layout_argument_force(this);
    }
	createBuilder() {
		return new DiagramBuilder_argument_force(this);
	}
	normalizeData(data) {
	    var id = 0;
	    $.each(data.nodes, function(index, node) {
	        if (node.id == null)
	            node.id = id++;
	        if (node.x != null)
	            delete node["x"];
	        if (node.y != null)
	            delete node["y"];
	    });
	    $.each(data.links, function(index, link) {
	        if (link.id == null)
	            link.id = id++;
	        if (link.source == null)
	            link.source = link.src;
	        if (link.target == null)
	            link.target = link.dst;
	    });
	}
	/* overridden */
	updateGraph() {
	    var self = this;
        var graph = this.getData();

        var simulation = d3
            .forceSimulation(graph.nodes)
            .force("link", d3.forceLink()
                .id(function(d) {
                    return d.id;
                })
                .links(graph.links)
            )
            .force("charge", d3.forceManyBody().strength(-100))
            .force("center", d3.forceCenter(self.svgWidth / 2, self.svgHeight / 2))
            //.force("collide", d3.forceCollide(15))
            .on("tick", ticked);

        self.nodes = self.nodesContainer
            .selectAll("g")
            .data(graph.nodes, d => d.id)
            .each(function(data, index) {
				var d3Node = d3.select(this);
				var node = self.builder.gotInstance($(this), data, self);
				node.graphUpdate(d3Node, data);
			})
			.enter()
			.append("g")
            .each(function(data, index) {
				var d3Node = d3.select(this);
				var node = self.builder.gotInstance($(this), data, self);
				node.graphEnter(d3Node, data);
			});
        self.nodes.call(
            d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

		self.nodes.exit()
            .each(function(data, index) {
				var d3Node = d3.select(this);
				var node = self.builder.gotInstance($(this), data, self);
				node.graphExit(d3Node, data);
			});

        self.links = self.linksContainer
            .selectAll("line")
            .data(graph.links, d => d.id)
            .each(function(data, index) {
				var d3Node = d3.select(this);
				var node = self.builder.gotInstance($(this), data, self);
				node.graphUpdate(d3Node, data);
			})
            .enter()
            .append("line")
            .each(function(data, index) {
				var d3Node = d3.select(this);
				var link = self.builder.gotInstance($(this), data, self);
				link.graphEnter(d3Node, data);
			});
        self.links.exit()
            .each(function(data, index) {
				var d3Node = d3.select(this);
				var link = self.builder.gotInstance($(this), data, self);
				link.graphExit(d3Node, data);
			});

        function ticked() {
            self.links
                .each(function(data, index) {
                    var node = self.builder.gotInstance($(this), data, self);
                    var d3Node = d3.select(this);
                    node.computePosition(d3Node, data);
			    });
            self.nodes
                .each(function(data, index) {
                    var node = self.builder.gotInstance($(this), data, self);
                    var d3Node = d3.select(this);
                    node.setPosition(d3Node, data);
			    });
        }

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
	}
	changeNodeLabel($node, text) {
		var self = this;
		var nodeData = d3.select($node[0]).data()[0];
		self.model.notifyChange(nodeData);
		nodeData.label = text;
		$node.find("text").html(text)
		self.computeNodeSize($node[0], nodeData)
	}
	focus(domElt, data) {
		var self = this;
		var $elt = $(domElt);
		if ($elt.hasClass("linksLayer")) {
			if (self.linkCreation.source == null) {
				//console.log("focus linksLayer");
				d3.select(domElt).style("cursor", "pointer").transition().attr("fill-opacity", "0.5").duration(200);
			} else {
				//console.log("SET TARGET")
				var elt = d3.select(domElt);
				self.linkCreation.target = elt;
				elt.style("cursor", "pointer").transition().attr("fill-opacity", "0.5").duration(300);
			}
		}
		else if ($elt.hasClass("node")) {
			//console.log("node");
		}
	}
	unfocus(domElt, data) {
		var self = this;
		var $elt = $(domElt);
		if ($elt.hasClass("linksLayer")) {
			if (self.linkCreation.source == null) {
				//console.log("focus linksLayer");
				d3.select(domElt).style("cursor", "default").transition().attr("fill-opacity", "0").duration(200);
			} else {
				var elt = d3.select(domElt);
				//console.log("elt", elt);
				//console.log("self.linkCreation.source", self.linkCreation.source);
				if (self.linkCreation.source != elt) {
					elt.style("cursor", "default").transition().attr("fill-opacity", "0").duration(200);
					self.linkCreation.target = null;
					//console.log("set target null");
				}
			}
		}
	}
}