class carteArgument {
    constructor(params) {
        var me = this;
        this.cont = d3.select("#"+params.idCont);
        this.width = params.width ? params.width : 600;
        this.height = params.height ? params.height : 600;
        this.dataUrl = params.dataUrl ? params.dataUrl : false;
        this.kId = params.kId ? params.kId : 'o:id'; //identifiant omeka S
        this.kName = params.kName ? params.kName : 'o:title'; //title omeka S
        this.data = params.data ? params.data : {}; 

        var svg, defs, markers=[],container, link, node, labelNode, rectNode, color, label, styles, tooltip;            

        this.init = function () {
            

            styles = me.data.styles;

                color = d3.scaleOrdinal(d3.schemeCategory10);

                //ajoute le tooltip
                tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

                //construction du svg
                svg = this.cont.append("svg").attr("width", me.width+'px').attr("height", me.height+'px')
                    .attr('viewBox',0+' '+0+' '+me.data.w+' '+me.data.h)
                    .attr('preserveAspectRatio','xMinYMin meet')

                //création des définitions
                defs = svg.append('defs');
                markers['']=defs.append('marker')
                .attr('id','head')
                .attr('orient','auto')
                .attr('markerWidth','2')
                .attr('markerHeight','4')
                .attr('refX','2') 
                .attr('refY','2')
                    .append('path')
                    .attr('d','M0,0 V4 L2,2 Z')
                    .attr('fill','red');

                //création du conteneur
                container = svg.append("g");

                //création du fond
                container.append('rect')
                    .attr("id", 'svgFond')
                    .attr("x", 0).attr("y", 0)
                    .attr("width", me.width+'px').attr("height", me.height+'px')
                    .attr('fill',"rgba("+styles[0]["map-style"]["background-color"]+")");

                svg.call(
                    d3.zoom()
                        .scaleExtent([.1, 4])
                        .on("zoom", function(event) { container.attr("transform", event.transform); })
                );
                
                //construction des noeuds
                node = container.append("g").attr("class", "nodes")
                    .selectAll("g")
                    .data(me.data.nodes)
                    .enter()
                    .append("g")
                    .attr("id", d => "gNode"+d.id)
                    .attr("transform",d=>"translate("+d.x+","+d.y+")")                    
                    .on('click', showTooltip)                
                    .on("mouseover", focus).on("mouseout", unfocus)                
                    .style("cursor", "pointer")
                    .call(
                        d3.drag()
                            .on("start", dragstarted)
                            .on("drag", dragged)
                            .on("end", dragended)
                    );
                
                //construction des enveloppes
                rectNode = node.append("rect")
                    .attr("class", "rectNode")
                    .attr("id", d=>"rectNode"+d.id)
                    .attr('stroke',d=>{
                        let s = "rgba("+styles[0]["concept-style"]["border-color"]+")";
                        if(d.style) s = d.style['border-color'] ? "rgba("+d.style['border-color']+")" : s;
                        if(d.type=="linking-phrase")s = "none";
                        return s  
                    })
                    .attr('stroke-width',styles[0]["concept-style"]["border-thickness"])                    
                    .attr('fill',d=>{
                        let s = "rgba("+styles[0]["concept-style"]["background-color"]+")";
                        if(d.style) s = d.style['color'] ? d.style['color'] : s;
                        if(d.type=="linking-phrase")s = "none";
                        return s
                    });
                    //.style("pointer-events", "none"); // to prevent mouseover/drag capture

                //construction des labels
                labelNode = node.append('text')
                    .attr("class", "labelNode")
                    .attr("id", d=>"labelNode"+d.id)
                    .attr('font-size',styles[0]["concept-style"]["font-size"])
                    .attr('font-family',styles[0]["concept-style"]["font-name"])
                    //.style('stroke',style[0]["concept-style"]["border-color"])
                    .attr('fill',d=>{
                        let s = "rgba("+styles[0]["concept-style"]["font-color"]+")";
                        //s = "none";
                        if(d.style) s = d.style['fgTextColor'] ? d.style['fgTextColor'] : s;
                        return s
                    })
                    .html(d=>d.label);
                    //.style("pointer-events", "none"); // to prevent mouseover/drag capture
                

                //redimensionne les enveloppes
                rectNode.each(function(d,i){
                    //récupère la taille du texte
                    let bb = d3.select("#labelNode"+d.id).node().getBBox();
                    let marge = parseInt(styles[0]["concept-style"]["text-margin"]);                    
                    d3.select(this)
                        .attr('x',-marge)
                        .attr('y',-marge-styles[0]["concept-style"]["font-size"])                    
                        .attr('width',bb.width+(marge*2))
                        .attr('height',bb.height+(marge*2));                    
                });


                //construction des liens
                link = container.append("g").attr("class", "links")
                    .selectAll("line")
                    .data(me.data.links)
                    .enter()
                    .append("line")
                    .attr('stroke',d=>{
                        let s = "rgba("+styles[0]["connection-style"]["color"]+")";
                        if(d.style) s = d.style['color'] ? d.style['color'] : s;
                        return s  
                    })
                    .attr('stroke-width',d=>{
                        let s = styles[0]["connection-style"]["thickness"]+"px";
                        if(d.style) s = d.style['thickness'] ? d.style['thickness'] : s;
                        return s  
                    })
                    .attr("marker-end",'url(#head)')
                    .attr('x1',d=>{
                        return 10;
                    })
                    .attr('y1',(d,i)=>{
                        return 10*i;
                    })
                    .attr('x2',(d,i)=>{
                        return 100*i
                    })
                    .attr('y2',d=>{
                        return 100;
                    });
                //redimensionne les liens
                link.each(function(d,i){
                    //récupère la source et la destination
                    let src = d3.select("#gNode"+d.src);
                    let dst = d3.select("#gNode"+d.dst);
                    //récupère les positions
                    let t = src.attr('transform');
                    let posiSrc = t.substring(10,t.indexOf(')')).split(',');
                    t = dst.attr('transform');
                    let posiDst = t.substring(10,t.indexOf(')')).split(',');
                    //récupère les tailles de la source et de la destination
                    let bbSrc = src.node().getBBox();
                    let bbDst = dst.node().getBBox();
                    let marge = parseInt(styles[0]["concept-style"]["text-margin"]);                    
                    d3.select(this)
                        .attr('x1',bbSrc.width+parseInt(posiSrc[0])-marge)
                        .attr('y1',parseInt(posiSrc[1])-(bbSrc.height/2))                    
                        .attr('x2',parseInt(posiDst[0])-marge)
                        .attr('y2',parseInt(posiDst[1])-(bbDst.height/2));                    
                });
         
                           
        }

        this.hide = function(){
          svg.attr('visibility',"hidden");
        }
        this.show = function(){
          svg.attr('visibility',"visible");
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

        function showTooltip(event, d){
            let n = d3.select(event.currentTarget);
            let bcr = n.node().getBoundingClientRect();
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            let html = '<h6>'+d.label+'</h6>'
                +'<a target="_blank" href="'+d.urlAdmin+'">admin</a>';
            tooltip.html(html)     
                .style("left", bcr.left + "px")             
                .style("top", bcr.top + "px");
        }

        /*
        function ticked() {
        
            node.call(updateNode);
            link.call(updateLink);
        
            labelLayout.alphaTarget(0.3).restart();
            labelNode.each(function(d, i) {
                if(i % 2 == 0) {
                    d.x = d.node.x;
                    d.y = d.node.y;
                } else {
                    var b = this.getBBox();
        
                    var diffX = d.x - d.node.x;
                    var diffY = d.y - d.node.y;
        
                    var dist = Math.sqrt(diffX * diffX + diffY * diffY);
        
                    var shiftX = b.width * (diffX - dist) / (dist * 2);
                    shiftX = Math.max(-b.width, Math.min(0, shiftX));
                    var shiftY = 16;
                    this.setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
                }
            });
            labelNode.call(updateNode);
        
        }
        */
        
        
        function focus(d) {
            /*
            var index = d3.select(d3.event.target).datum().index;
            node.style("opacity", function(o) {
                return neigh(index, o.index) ? 1 : 0.1;
            });
            labelNode.attr("display", function(o) {
                return neigh(index, o.node.index) ? "block": "none";
            });
            link.style("opacity", function(o) {
                return o.source.index == index || o.target.index == index ? 1 : 0.1;
            });
            */
        }
        
        function unfocus() {
            labelNode.attr("display", "block");
            node.style("opacity", 1);
            link.style("opacity", 1);
        }
                
        function dragstarted(event, d) {
            //d3.event.sourceEvent.stopPropagation();
            //let n = d3.select(d3.event.currentTarget);
            //if (!d3.event.active) graphLayout.alphaTarget(0.3).restart();
            d.x = d.x;
            d.y = d.y;
        }
        
        function dragged(event, d) {
            let n = d3.select(this);
            n.attr('transform','translate('+event.x + "," + event.y+')');
        }
        
        function dragended(event, d) {
            //if (!d3.event.active) graphLayout.alphaTarget(0);
            d.x = null;
            d.y = null;
        }              

        if(me.dataUrl){
            d3.json(me.dataUrl).then(function(graph) {
                me.data = graph;
                me.init();
            });    
        }else{
            me.init();
        }

    }
}

  


