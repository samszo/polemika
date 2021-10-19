class Diagram_argument_force extends Diagram {

    constructor(params) {
        super(params);
		this.model = new DiagramModel_argument_force();
		this.linkCreation = {
			source : null,
			target : null
		}
    }
	createBuilder() {
		return new DiagramBuilder_argument_force(this);
	}
	normalizeData(data) {
	    var self = this;
	    $.each(data.nodes, function(index, node) {
	        node.kind = "node";
	        self.model.normalizeData(node);
	    });
	    $.each(data.links, function(index, link) {
	        link.kind = "link";
	        self.model.normalizeData(link);
	    });
	}
	/* overridden */
	updateGraph() {
	    var self = this;
        var graph = this.getData();


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

        /*this.layout = new Layout_argument_force(this, graph.nodes, graph.links);
        this.layout.simulation.restart();*/

        this.simulation = d3
            .forceSimulation(graph.nodes)
            .stop()
            .force("link", d3.forceLink()
                .id(function(d) {
                    return d.id;
                })
                .links(graph.links)
            )
            .force("charge", d3.forceManyBody().strength(-100))
            .force("center", d3.forceCenter(self.svgWidth / 2, self.svgHeight / 2))
            //.force("collide", d3.forceCollide(15))
            .on("tick", function() {
                self.ticked();
            });
        //this.simulation.restart();
        



        function dragstarted(event, d) {
            if (!event.active) self.simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) self.simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
	}

    ticked() {
        var self = this;
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

}