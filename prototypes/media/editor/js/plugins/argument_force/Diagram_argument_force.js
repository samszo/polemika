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
    import(rootNode, data) {
        var self = this;
        this.normalizeData(data);
        var graphData = self.getData();
        var newNodeIds = [];
        $.each(data.nodes, function(index, nodeData) {
            var existingNode = _.find(graphData.nodes, function(elt) {
                return elt.id == nodeData.id;
            });
            if (existingNode == null) {
                nodeData.x = rootNode.data.x;
                nodeData.y = rootNode.data.y;
                self.addNode(nodeData, rootNode.data);
                self.model.notifyCreation(nodeData);
                newNodeIds.push(nodeData.id);
            }
        });
        $.each(data.links, function(index, linkData) {
            var existingLink = _.find(graphData.links, function(elt) {
                return elt.id == linkData.id;
            });
            if (existingLink == null) {
                self.addLink(linkData);
                self.model.notifyCreation(linkData);
            }
        });
        self.updateGraph();
        var nodes = [];
        $.each(newNodeIds, function(index, nodeId) {
            nodes.push(self.getNode(nodeId));
        });
        self.startAutoLayout(nodes);
    }
    getNode(nodeId) {
        var d3Node = d3.select("#gNode"+nodeId);
        var node = this.builder.gotInstance($(d3Node.node()));
        return node;
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
        var graphChanged = false;

        self.nodes = self.nodesContainer
            .selectAll("g")
            .data(graph.nodes, d => d.id);
        var nodesEntered = self.nodes.enter()
			.append("g")
            .each(function(data, index) {
				var d3Node = d3.select(this);
				var node = self.builder.gotInstance($(this), data, self);
				node.graphEnter(d3Node, data);
				graphChanged = true;
			});
        self.nodes
            .each(function(data, index) {
				var d3Node = d3.select(this);
				var node = self.builder.gotInstance($(this), data, self);
				node.graphUpdate(d3Node, data);
			})
		self.nodes.exit()
            .each(function(data, index) {
				var d3Node = d3.select(this);
				var node = self.builder.gotInstance($(this), data, self);
				node.graphExit(d3Node, data);
				graphChanged = true;
			});
        self.nodes = self.nodes.merge(nodesEntered);

        self.links = self.linksContainer
            .selectAll("line")
            .data(graph.links, d => d.id);
        var linksEntered = self.links.enter()
            .append("line")
            .each(function(data, index) {
				var d3Node = d3.select(this);
				var link = self.builder.gotInstance($(this), data, self);
				link.graphEnter(d3Node, data);
				graphChanged = true;
			});
        self.links
            .each(function(data, index) {
				var d3Node = d3.select(this);
				var node = self.builder.gotInstance($(this), data, self);
				node.graphUpdate(d3Node, data);
			})
        self.links.exit()
            .each(function(data, index) {
				var d3Node = d3.select(this);
				var link = self.builder.gotInstance($(this), data, self);
				link.graphExit(d3Node, data);
				graphChanged = true;
			});
        self.links = self.links.merge(linksEntered);
        if (graphChanged)
            this.initLayout();
	}
    initLayout() {
        var self = this;
        var graph = this.getData();
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
            //.force("center", d3.forceCenter(self.svgWidth / 2, self.svgHeight / 2))
            //.force("collide", d3.forceCollide(15))
            .on("tick", function() {
                self.ticked();
            });
    }
    ticked() {
        var self = this;
        self.links
            .each(function(data, index) {
                var link = self.builder.gotInstance($(this), data, self);
                var d3Node = d3.select(this);
                link.computePosition(d3Node, data);
            });
        self.nodes
            .each(function(data, index) {
                var node = self.builder.gotInstance($(this), data, self);
                var d3Node = d3.select(this);
                if (node.isInLayoutScope())
                    node.computePosition(d3Node, data);
            });
    }

    startAutoLayout(nodes) {
        console.log("start autoLayout");
        this.layoutElements = nodes;
        var self = this;
        $.each(nodes, function(index, node) {
            node.setInLayoutScope(true);
        });
        //this.simulation.restart();
        this.simulation.alphaTarget(0.3).restart()
    }
    stopAutoLayout() {
        console.log("stop autoLayout");
        var self = this;
        $.each(this.layoutElements, function(index, node) {
            node.setInLayoutScope(false);
        });
        this.simulation.stop();
        this.layoutElements = [];
    }
}