/*
  阴影标识
*/
var defsft = svg.append("defs");
var filter = defsft.append("filter")
    .attr("id", "drop-shadow")
    .attr("height", "130%");

filter.append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 2)
    .attr("result", "blur");

filter.append("feOffset")
    .attr("in", "blur")
    .attr("dx", 0)
    .attr("dy", 0)
    .attr("result", "offsetBlur");


var feMerge = filter.append("feMerge");
feMerge.append("feMergeNode")
    .attr("in", "offsetBlur")
feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");

/*
单向箭头标识
*/
var defsow = svg.append("defs");
var arrowMarkerOneWay = defsow.append("marker")
                        .attr("id","arrow-one-way")
                        .attr("markerUnits","strokeWidth")
                        .attr("markerWidth","3")
                        .attr("markerHeight","3")
                        .attr("viewBox","0 0 14 14") 
                        .attr("refX","10")
                        .attr("refY","6")
                        .attr("orient","auto");

var arrowPathOneWay = "M5,4 L10,4 L10,2 L14,6 L10,10 L10,8 L5,8 L5,4";
arrowMarkerOneWay.append("path")
            .attr("d",arrowPathOneWay)
            .attr("fill","rgba(100,100,100,0.8)");
/*
双向箭头标识
*/
var defstw = svg.append("defs");
var arrowMarkerTwoWay = defstw.append("marker")
                        .attr("id","arrow-two-way")
                        .attr("markerUnits","strokeWidth")
                        .attr("markerWidth","3")
                        .attr("markerHeight","3")
                        .attr("viewBox","0 0 14 14") 
                        .attr("refX","6")
                        .attr("refY","6")
                        .attr("orient","auto");

var arrowPathTwoWay = "M1,6 L5,2 L5,4 L10,4 L10,2 L14,6 L10,10 L10,8 L5,8 L5,10 L1,6";
arrowMarkerTwoWay.append("path")
            .attr("d",arrowPathTwoWay)
            .attr("fill","rgba(100,100,100,0.8)");