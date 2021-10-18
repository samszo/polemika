class Layout_argument_force {

    constructor(diagram, nodes, links) {
        var self = this;
        this.diagram = diagram;
        this.simulation = d3
            .forceSimulation(nodes)
            .stop()
            .force("link", d3.forceLink()
                .id(function(d) {
                    return d.id;
                })
                .links(links)
            )
            .force("charge", d3.forceManyBody().strength(-100))
            .force("center", d3.forceCenter(self.svgWidth / 2, self.svgHeight / 2))
            //.force("collide", d3.forceCollide(15))
            .on("tick", function() {
                self.diagram.links
                    .each(function(data, index) {
                        var node = self.diagram.builder.gotInstance($(this), data, self);
                        var d3Node = d3.select(this);
                        node.computePosition(d3Node, data);
                    });
                self.diagram.nodes
                    .each(function(data, index) {
                        var node = self.diagram.builder.gotInstance($(this), data, self);
                        var d3Node = d3.select(this);
                        node.setPosition(d3Node, data);
                    });
            });
    }
    /*ticked() {
        var self = this;
        this.links
            .each(function(data, index) {
                var node = self.diagram.builder.gotInstance($(this), data, self);
                var d3Node = d3.select(this);
                node.computePosition(d3Node, data);
            });
        this.nodes
            .each(function(data, index) {
                var node = self.diagram.builder.gotInstance($(this), data, self);
                var d3Node = d3.select(this);
                node.setPosition(d3Node, data);
            });
    }*/
}

/*class Layout_argument_force {

    constructor(diagram) {
        this.diagram = diagram;
    }
    init(nodes, links) {
        var self = this;
        this.nodes = nodes;
        this.links = links;
        this.simulation = d3
            .forceSimulation(this.nodes)
            .stop()
            .force("link", d3.forceLink()
                .id(function(d) {
                    return d.id;
                })
                .links(this.links)
            )
            .force("charge", d3.forceManyBody().strength(-100))
            .force("center", d3.forceCenter(self.svgWidth / 2, self.svgHeight / 2))
            //.force("collide", d3.forceCollide(15))
            .on("tick", function() {
                self.ticked()
            });
    }
    ticked() {
        var self = this;
        self.diagram.links
            .each(function(data, index) {
                var node = self.diagram.builder.gotInstance($(this), data, self);
                var d3Node = d3.select(this);
                node.computePosition(d3Node, data);
            });
        self.diagram.nodes
            .each(function(data, index) {
                var node = self.diagram.builder.gotInstance($(this), data, self);
                var d3Node = d3.select(this);
                node.setPosition(d3Node, data);
            });
    }

}*/