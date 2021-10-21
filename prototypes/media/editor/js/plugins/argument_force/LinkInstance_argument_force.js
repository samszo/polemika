class LinkInstance_argument_force extends LinkInstance {

    constructor(domElt, data, archetype, diagram) {
		super(domElt, data, archetype, diagram);
		this.sourceNode = null;
		this.targetNode = null;
    }
	/* overridden */
	getActions() {
		var self = this;
		var actions = {
			"supprimer" : {
				multi: true,
				func: function(selection) {
					$.each(selection, function(index, domElt) {
                        var instance = self.diagram.builder.gotInstance($(domElt));
						instance.delete(true);
					});
				}
			}
		};
		if (self.data.cssStyle && self.data.cssStyle.length > 0)
			actions["Réifier"] = {
				multi: false,
				func: function(selection) {
					var instance = self.diagram.builder.gotInstance($(selection[0]));
					self.diagram.editor.reificationModal.open(instance);
				}
			};
		return actions;
	}
	graphEnter(d3Node, data) {
        //console.log("LinkInstance_argument_force> graphEnter");
        var self = this;
        d3Node
			.attr("class", "link")
			.attr('stroke',d=>{
				return "rgba(0,0,0,255)";
			})
			.attr('stroke-width',d=>{
				return "1px";
			})
			.attr("marker-end",'url(#head)')
			.on('click', function(event, data) {
				console.log("link->click");
                event.stopPropagation(); // if a rectNode is clicked, stop progation to not take into account container click event (we don't want to deselect just after)
                if (self.diagram.linkCreation.source == null) {
                    var selection = self.diagram.selection.slice();
                    if (!event.ctrlKey)
                        selection = [];
                    selection.push(this);
                    self.diagram.setSelection(selection);
                }
			});
        // define source and target data
        let src = d3.select("#gNode"+data.src);
        let dst = d3.select("#gNode"+data.dst);
        self.sourceNode = src;
        self.targetNode = dst;
        var targetNode = self.diagram.builder.gotInstance($(dst.node()), data, self);
        targetNode.inputs.push(self);
        var sourceNode = self.diagram.builder.gotInstance($(src.node()), data, self);
        sourceNode.outputs.push(self);
        self.computePosition(d3Node, data);
	}
	graphUpdate(d3Node, data) {
	    //console.log("LinkInstance_argument_force> graphUpdate");
	    if (this.updatePosition) {
	        this.updatePosition = false;
	        this.computePosition(d3Node, data);
	    }
	}
	graphExit(d3Node, data) {
	    console.log("LinkInstance_argument_force> graphExit");
	    d3Node.remove();
	}
	computePosition(d3Node, data) {
		var srcData = this.sourceNode.data()[0];
		var dstData = this.targetNode.data()[0];
		var w1 = srcData.width / 2;
		var h1 = srcData.height / 2;
		var w2 = dstData.width / 2;
		var h2 = dstData.height / 2;

		var cx1 = srcData.x;
		var cy1 = srcData.y;
		var cx2 = dstData.x;
		var cy2 = dstData.y;

        if (!isNaN(cx1)) {
            var dx = cx2 - cx1;
            var dy = cy2 - cy1;

            var p1 = this.getIntersection(dx, dy, cx1, cy1, w1, h1);
            var p2 = this.getIntersection(-dx, -dy, cx2, cy2, w2, h2);
            if (p1 != null && p2 != null)
                d3Node
                    .attr('x1', p1.x)
                    .attr('y1', p1.y)
                    .attr('x2', p2.x)
                    .attr('y2', p2.y);
        }
	}
	getIntersection(dx, dy, cx, cy, w, h) {
		if (dx == 0 && dy == 0)
		    return null;
		else {
            if (Math.abs(dy / dx) < h / w) {
                // Hit vertical edge of box1
                return {
                    x: cx + (dx > 0 ? w : -w),
                    y: cy + dy * w / Math.abs(dx)
                };
            } else {
                // Hit horizontal edge of box1
                return {
                    x: cx + dx * h / Math.abs(dy),
                    y: cy + (dy > 0 ? h : -h)
                };
            }
		}
	}
}