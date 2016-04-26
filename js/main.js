;(function(){
    var dataNodes = [];
    var dataLinks = [];

    var tip = d3.select("body").append("div").attr("class","tip");

    var zoom = d3.behavior.zoom()
    .scaleExtent([0.5, 3])
    .on("zoom", zoomed);

    var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

    var diagonal = d3.svg.diagonal().projection(function(d) { return [d.x, d.y]; });

    var dataArc = d3.svg.arc()
        .startAngle(0)
        .endAngle(function(d) { return d.sa * Math.PI; });

    var svg = d3.select(".content").append("svg")
    .attr("class","container")
    .attr("width",config.width)
    .attr("height",config.height)
    .call(zoom)
    .on('dblclick.zoom', null);

    var rect = svg.append("rect")
    .attr("width",config.width)
    .attr("height",config.height)
    .style("fill", "none")
    .style("pointer-events", "all");


    var container = svg.append("g").attr("class", "canvas");

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
    var defsow = svg.append("defs")
    .append("marker")
    .attr("id","arrow-one-way")
    .attr("markerUnits","strokeWidth")
    .attr("markerWidth","2")
    .attr("markerHeight","2")
    .attr("viewBox","0 0 14 14")
    .attr("refX","8")
    .attr("refY","6")
    .attr("orient","auto")
    .append("path")
    .attr("d","M10,6 L10,2 L14,6 L10,10 L10,6")
    .attr("fill","#aaaaaa");
    /*
    双向箭头标识
    */
    var defstw = svg.append("defs")
    .append("marker")
    .attr("id","arrow-two-way")
    .attr("markerUnits","strokeWidth")
    .attr("markerWidth","3")
    .attr("markerHeight","3")
    .attr("viewBox","0 0 14 14")
    .attr("refX","6")
    .attr("refY","6")
    .attr("orient","auto")
    .append("path")
    .attr("d","M1,6 L5,2 L5,4 L10,4 L10,2 L14,6 L10,10 L10,8 L5,8 L5,10 L1,6")
    .attr("fill","#aaaaaa");


    var types = null;//装载types ele的map
    var nodes = null;//装载nodes ele的map
    var linksL = null;//装载lineto links ele的数组
    var linksC = null;//装载parentto links ele的数组

    var nameMap = {};//储存数据中的name:生成的虚拟name
    var nameMapRe = {};//针对上面那个把name和value反过来的
    var typeArray = [];//装载type 的数组
    var nodesDataMap = {};//装载nodes 数据的map
    var linksLineToDataMap = {};//装载lineto links 数据的map
    var linksChildrenDataMap = {};//装载parentto links 数据的map
    var linksLineTo = [];//装载lineto links 数据的map
    var linksChildren = [];//装载parentto links 数据的map

    var eles = [];
    var texts = [];

    //为双击事件定义一个可自行触发的事件监听
    var dispatch = d3.dispatch('nodeDblclick');
    dispatch.on("nodeDblclick",nodedblclicked);

    //event handlers
    function zoomed() {
        container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
        d3.select(this).classed("dragging", true);
    }

    function dragged(d) {
        d3.select(this)
        .attr("transform", "translate(" + d3.event.x+","+d3.event.y+ ")")
        .attr("x",d.x = d3.event.x).attr("y", d.y = d3.event.y);

        d3.selectAll("[source="+d.name+"]").each(function(eled,elei){
            var Ldata = d3.select(this).data()[0].target;
            var Ltype = d3.select(this).data()[0].type;
            var sdx = calcRadius(d);
            var tdx = calcRadius(Ldata);
            var p1={x:d.x+sdx,y:d.y+sdx},p2={x:Ldata.x+tdx,y:Ldata.y+tdx};
            d3.select(this).attr("d",updatePtah(p1,p2,sdx,tdx,Ltype));
        });

        d3.selectAll("[target="+d.name+"]").each(function(eled,elei){
            var Ldata = d3.select(this).data()[0].source;
            var Ltype = d3.select(this).data()[0].type;
            var sdx = calcRadius(Ldata);
            var tdx = calcRadius(d);
            var p1={x:Ldata.x+sdx,y:Ldata.y+sdx},p2={x:d.x+tdx,y:d.y+tdx};
            d3.select(this).attr("d",updatePtah(p1,p2,sdx,tdx,Ltype));
        });
    }

    function dragended(d) {
        d3.select(this).classed("dragging", false);
    }

    function nodemouseovered(d){
        var lineToStr = "";
        var name = d3.select(this).data()[0].name;
        d3.select(this).classed("nodehover",true);
        $(".canvas>*:not([data-node-id="+name+"])").css("opacity","0.1");

        /*
        * linkst 会执行动画 从源到目标
        * linkts 会执行动画 从目标到源
        */

        //所有source是当前节点的线加上class linkst
        d3.selectAll("[source="+d.name+"]").each(function(eled,elei){
            var type = d3.select(this).attr("type");
            var targetName = d3.select(this).data()[0].target.name;

            d3.select("[data-node-id="+targetName+"]").style("opacity","1");
            d3.select(this).style("opacity","1");
            if(type!="c"){
                d3.select(this).classed("linkhover linkst",true);
            }
        })

        //所有target是当前节点且是双向线的link 加上class linkts
        d3.selectAll("[target="+d.name+"]").each(function(eled,elei){
            var type = d3.select(this).attr("type");
            var sourceName = d3.select(this).data()[0].source.name;

            d3.select("[data-node-id="+sourceName+"]").style("opacity","1");
            d3.select(this).style("opacity","1");
            if(type=="s"){d3.select(this).classed("linkhover linkst",true);}
            else if(type=="d"){d3.select(this).classed("linkhover linkts",true);}

        })

        for(var l=0;l<d.lineTo.length;l++){
            lineToStr += " "+d.lineTo[l].node.displayName;
            d3.select("[data-node-id="+d.lineTo[l].node.name+"]").classed("nodehover",true);
        }

        var tipHtml = lineToStr.length>0?
            ("Name: "+d.displayName+"<br>"+"Line to:"+lineToStr+"<br>x:"+d.x+";y:"+d.y):
            ("Name: "+d.displayName+"<br>x:"+d.x+";y:"+d.y)

        tip.classed("show",true)
        .style("left",d3.event.pageX+"px")
        .style("top",d3.event.pageY+"px").html(tipHtml);
    }

    function nodemousemoved(d){
        tip
        .style("left",d3.event.pageX+10+"px")
        .style("top",d3.event.pageY+10+"px");
    }

    function nodemouseouted(d){
        var name = d3.select(this).data()[0].name;
        d3.select(this).classed("nodehover",false);
        d3.selectAll(".canvas>*:not([data-node-id="+name+"])").style("opacity","1");

        d3.selectAll("[source="+d.name+"]").classed("linkhover linkst",false);
        d3.selectAll("[target="+d.name+"]").classed("linkhover linkst linkts",false);
        for(var l=0;l<d.lineTo.length;l++){
            d3.select("[data-node-id="+d.lineTo[l].node.name+"]").classed("nodehover",false);
        }
        tip.classed("show",false).html("");
    }

    function nodedblclicked(d){
        var node = this.length==undefined?d3.select(this):this;//自定义触发事件时 this上下文是d3对象（为arrry），因此需判断是否有length
        var childrenShown = node.attr("data-childrenShown");
        if(childrenShown=="false"){
            node.attr("data-childrenShown",d.childrenShown = true);
            showChildren(d,node);
        } else {
            node.attr("data-childrenShown",d.childrenShown = false);
            hideChildren(d,node);
        }

    }

    function linkmouseovered(d){
        tip.classed("show",true)
        .style("left",d3.event.pageX+10+"px")
        .style("top",d3.event.pageY+10+"px").text(d.source.displayName+" to "+d.target.displayName);

    }

    function linkmousemoved(d){
        tip
        .style("left",d3.event.pageX+10+"px")
        .style("top",d3.event.pageY+10+"px");
    }

    function linkmouseouted(d){
        tip.classed("show",false).text("");
    }

    function dataInit(){
        $.getScript(config.serviceApi.getAllData.url,function(){
            nodesData = nodesStaticData;
            initChartData();
            initChart();
        })

        if(config.useStaticDat==true){
            initTableData();
            initTable();
            pushData();
            refereTable()
        } else {
            pushData();
            d3.json(config.serviceUrl+config.serviceApi.getTableData.url, function(error, json) {
                if (error) return console.warn(error);
                    tableData = json;
                    initTableData();
                    initTable();
                    refereTable()
            });
        }
    }

    function pushData(){
        setInterval(function(){
            if(config.useStaticDat==true){
                doDataAction();
            }else{
                d3.json(config.serviceUrl+config.serviceApi.getUpdata.url, function(error, json) {
                    if (error) return console.warn(error);
                        refereData = json;
                        doDataAction();
                });
            }

        },60000)
    }

    function doDataAction(){
        for(var r=0;r<refereData.length;r++){
            doAnimeta(refereData[r])
        }
    }

    function doAnimeta(nameArr){
        var pointArr = [];
        nameArr.map(function(d,i){
            if(d.length>0&&d!=""){
                var nodeData = nodesDataMap[nameMap[d]];
                var r = 0;
                var point = {};
                if(nodeData.deps>1&&d3.select("[data-node-id="+nameMap[d]+"]").classed("hideNode")==true){
                    var parentData = nodeData.parent;
                    r = calcRadius(parentData);
                    point = {x:parentData.x + r,y:parentData.y + r};
                } else {
                    r = calcRadius(nodeData);
                    point = {x:nodeData.x + r,y:nodeData.y + r};
                }

                pointArr.push(point);
            }

        });

        var animateCircle = container.append("circle")
        .attr("class","node-data-dot")
        .attr("r",15);

        (function t(d,i){
            if(i<(d.length-1)){
                animateCircle
                .attr("cx",d[i].x)
                .attr("cy",d[i].y)
                .transition()
                .ease("linear")
                .duration(2000)
                .attr("cx",d[i+1].x)
                .attr("cy",d[i+1].y)
                .each("end",function(){
                    i++;
                    t(d,i);
                });
            } else {
                animateCircle
                .transition()
                .duration(800)
                .style("r",30)
                .style("opacity",0)
                .transition()
                .duration(100)
                .remove();
            }

        })(pointArr,0);
    }

    function refereTable(){
        setInterval(function(){
            if(config.useStaticDat==true){
                initTableData();
                initTable();
            }else{
                d3.json(config.serviceUrl+config.serviceApi.getTableData.url, function(error, json) {
                    if (error) return console.warn(error);
                        tableData = json;
                        initTableData();
                        initTable();
                });
            }

        },60000)
    }

    function startSocket(){
        var  wsServer = config.serviceApi.getUpdata.url;
        var  websocket = new WebSocket(wsServer);
        websocket.onopen = function (evt) { onOpen(evt) };
        websocket.onclose = function (evt) { onClose(evt) };
        websocket.onmessage = function (evt) { onMessage(evt) };
        websocket.onerror = function (evt) { onError(evt) };
    }

    function onOpen(evt) {
        console.log("Connected to WebSocket server.");
    }
    function onClose(evt) {
        console.log("Disconnected");
    }
    function onMessage(evt) {
        console.log('Retrieved data from server: ' + evt.data);
    }
    function onError(evt) {
        console.log('Error occured: ' + evt.data);
    }




    //systems funs
    function init(){
        console.log("Author:周劼 n/E-mail:alexzj_1983@163.com")
        dataInit();

    }

    function initChartData(){
        setNodesData();
        setLinksData();
    }

    function initChart(){
        draw();
    }

    //set nodes data
    var center = null;
    var partmentArr = [];//部门
    var norArr = [];//非部门节点应用等其他
    var hasChildren = [];//有子节点的节点

    function setNodesData(){
        //push node data to a map
        for(var i=0;i<nodesData.length;i++){
            nameMap[nodesData[i].name] = nodesData[i].type + "_" + i;
            nameMapRe[nodesData[i].type + "_" + i] = nodesData[i].name;
            nodesData[i].name = nodesData[i].type + "_" + i;
            nodesDataMap[nodesData[i].name] = nodesData[i];

            var type = nodesData[i].type;
            var hasThisType = false;
            for(var t=0;t<typeArray.length;t++){//初始化type 数据
                if(typeArray[t]==type){
                    hasThisType=true;
                    break;
                }
            }
            //获得所有type 并放入数组
            if(hasThisType==false){typeArray.push(type)}
        }




        for(var k in nodesDataMap){

            //push children node obj to children
            nodesDataMap[k].parent = nameMap[nodesDataMap[k].parent]?nameMap[nodesDataMap[k].parent]:"";

            var p = nodesDataMap[k].parent;

            if(p!=""){
                nodesDataMap[k].parent = nodesDataMap[nodesDataMap[k].parent];
                nodesDataMap[k].parent.children.push(nodesDataMap[k]);
            }

            //push lineto node obj to lineto replace the name string
            var lt = nodesDataMap[k].lineTo;
            if(lt.length>0&&nodesDataMap[k].deps>1){
                //如果子节点有lineto，则将其存入父节点的lineto中
                var p = typeof(nodesDataMap[k].parent)=="string"?nodesDataMap[nodesDataMap[k].parent]:nodesDataMap[k].parent;
                for(var l=0;l<lt.length;l++){
                    var lele = lt[l].split(",")[0];
                    var ltype = "ch"+lt[l].split(",")[1];//子元素的type 加给父元素后为ch开头后面依旧为s d p
                    //将其恢复到字符串并加入到父元素的lineto
                    var lStr = lele + "," + ltype;
                    if(p.lineTo.indexOf(lStr)==-1){//如果当前数组中不存在这个link数据则推入
                        p.lineTo.push(lStr);
                    }

                }
                //nodesDataMap[k].lineTo = [];
            }

        }

        for(var k in nodesDataMap){
            if(nodesDataMap[k].type=="center"){
                center = nodesDataMap[k];
                var h = parseInt(d3.select(".content").style("height").replace("px",""))/2;
                var w = parseInt(d3.select(".content").style("width").replace("px",""))/2;
                center.x = w;
                center.y = h;
            }

            if(nodesDataMap[k].deps==1){
                if(nodesDataMap[k].type=="partment"){
                    partmentArr.push(nodesDataMap[k]);
                } else {
                    norArr.push(nodesDataMap[k]);
                }
                if(nodesDataMap[k].children.length>0){
                    hasChildren.push(nodesDataMap[k]);
                }
            }

            //对lineto数组对象化
            //push lineto node obj to lineto replace the name string
            var lt = nodesDataMap[k].lineTo;
            var ltArr = [];
            if(lt.length>0){
                for(var l=0;l<lt.length;l++){
                    var lele = nameMap[lt[l].split(",")[0]];
                    var ltype = lt[l].split(",")[1];

                    var litem = {
                        node:nodesDataMap[lele],
                        type:ltype
                    }

                    ltArr.push(litem);
                }
                nodesDataMap[k].lineTo = ltArr;
            }


        }




        partmentArr.map(function(d,i){
            var a,x,y;
            if(i<=5){
                a = i/6*Math.PI*2;
                x = config.partmentDis*Math.cos(a) + center.x;
                y = config.partmentDis*Math.sin(a) + center.y;
            } else {
                a = i/8*Math.PI*2;
                x = (config.partmentDis*1.8)*Math.cos(a) + center.x;
                y = (config.partmentDis*1.8)*Math.sin(a) + center.y;
            }

            d.x = d.x==0? x:d.x;
            d.y = d.y==0? y:d.y;
        });

        norArr.map(function(d,i){
            var a = i/(norArr.length)*Math.PI*2;
            var x = config.nodeDis*Math.cos(a) + center.x;
            var y = config.nodeDis*Math.sin(a) + center.y;
            d.x = d.x==0? x:d.x;
            d.y = d.y==0? y:d.y;
        })


        //需要移动到展开时调用
        hasChildren.map(function(dp,ip){
            var cx = dp.x;
            var cy = dp.y;
            var childrenArr = dp.children;
            childrenArr.map(function(d,i){
                var childrenDis = dp.children.length*2
                var a = i/(childrenArr.length)*Math.PI*2;
                var x = config.childrenDis*Math.cos(a) + cx + childrenDis;
                var y = config.childrenDis*Math.sin(a) + cy + childrenDis;
                d.x = x;
                d.y = y;

                if(d.children.length>0){
                    var cha = i/(childrenArr.length)*Math.PI*2;
                    var chx = config.childrenDis*1.8*Math.cos(a) + cx + childrenDis;
                    var chy = config.childrenDis*1.8*Math.sin(a) + cy + childrenDis;
                    d.children[0].x = chx;
                    d.children[0].y = chy;
                }
            })
        })
    }

    function setLinksData(){
        setLinksDataLineTo();
        setLinksDataChildren();
    }

    //set links by nodesDataMap [lineto data]
    function setLinksDataLineTo(){
        var links = [];
        for(var k in nodesDataMap){
            var ltArr = nodesDataMap[k].lineTo;
            if(ltArr.length>0){
                for(var l=0;l<ltArr.length;l++){
                    var link = {};
                    link.source = nodesDataMap[k];
                    link.target = ltArr[l].node;
                    link.type = ltArr[l].type;
                    links.push(link);
                }
            }
        }
        linksLineTo = links;
    }

    //set links by nodesDataMap [children data]
    function setLinksDataChildren(){
        var links = [];
        for(var k in nodesDataMap){
            var cArr = nodesDataMap[k].children;
            if(cArr.length>0){
                for(var c=0;c<cArr.length;c++){
                    var link = {};
                    link.source = nodesDataMap[k];
                    link.target = cArr[c];
                    link.type = "c";
                    links.push(link);
                }
            }
        }
        linksChildren = links;
    }

    var modelTableData = null;
    var dataExcTableData = null;
    var connectStatusTableData = null;
    var excNumTableData = null;

    function initTableData(){
        modelTableData = tableData.table1;
        dataExcTableData = tableData.table2;
        connectStatusTableData = tableData.table3;
        excNumTableData = tableData.table4;
    }

    function initTable(){
        //table 1
        $("#modelTable .tr:eq(0) .td:eq(1)").text(modelTableData.storage);
        $("#modelTable .tr:eq(1) .td:eq(1)").text(modelTableData.project);
        $("#modelTable .tr:eq(2) .td:eq(1)").text(modelTableData.partment);

        //table 2
        for(var i=0;i<dataExcTableData.length;i++){
            $("#dataExcTable .tr:eq("+i+") .td:eq(0)").text(dataExcTableData[i].dataTopic);
            $("#dataExcTable .tr:eq("+i+") .td:eq(1)").text(dataExcTableData[i].source);
            $("#dataExcTable .tr:eq("+i+") .td:eq(2)").text(dataExcTableData[i].target);
            $("#dataExcTable .tr:eq("+i+") .td:eq(3)").text(dataExcTableData[i].date);
            $("#dataExcTable .tr:eq("+i+") .td:eq(4)").text(dataExcTableData[i].num);
        }

        //table 3
        for(var i=0;i<connectStatusTableData.length;i++){
            $("#connectStatusTable .tr:eq("+i+") .td:eq(0)").text(connectStatusTableData[i].name);
            $("#connectStatusTable .tr:eq("+i+") .td:eq(1)").text(connectStatusTableData[i].date);
            $("#connectStatusTable .tr:eq("+i+") .td:eq(2)").text(connectStatusTableData[i].flag);
        }

        //table 4
        for(var i=0;i<excNumTableData.length;i++){
            $("#excNumTable .tr:eq("+i+") .td:eq(0)").text(excNumTableData[i].dataTopic);
            $("#excNumTable .tr:eq("+i+") .td:eq(1)").text(excNumTableData[i].date);
            $("#excNumTable .tr:eq("+i+") .td:eq(2)").text(excNumTableData[i].dep);
            $("#excNumTable .tr:eq("+i+") .td:eq(3)").text(excNumTableData[i].num);

        }
    }


    function calcRadius(d){
        var childrenLength = d.children.length;
        var deps = d.deps;
        return 40+(1-deps)*10+childrenLength*0.5;
    }

    var lineXFun = d3.scale.linear().domain([0,1]);
    var lineYFun = d3.scale.linear().domain([0,1]);
    var abs = Math.abs;
    var sqrt = Math.sqrt;
    var pow = Math.pow;

    function updatePtah(p1,p2,d1R,d2R,type){
        var ld = [];
        var x1 = p1.x;
        var y1 = p1.y;
        var x2 = p2.x;
        var y2 = p2.y;

        lineXFun.range([x1,x2]);
        lineYFun.range([y1,y2]);
        var xm = lineXFun(0.5);
        var ym = lineYFun(0.5);

        var xnum = abs(x1-x2);
        var ynum = abs(y1-y2);
        var d = sqrt(pow(xnum,2)+pow(ynum,2));//三角函数计算中点

        var dx2m = type=="d"?4:8
        var dx1 = d1R+2+4;//线尾部 半径加上 边框 加空距离
        var dx2 = d2R+2+dx2m;//线尾部 半径加上 边框 加空距离，如果是双向为4 单向型为8

        var xd1 = lineXFun(dx1/d);
        var yd1 = lineYFun(dx1/d);

        var xd2 = lineXFun((d-dx2)/d);
        var yd2 = lineYFun((d-dx2)/d);

        var lineFun = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

        ld = [
            {x:xd1,y:yd1},
            {x:xm,y:ym},
            {x:xd2,y:yd2}
        ]

        return lineFun(ld);
    }

    function draw(){
        drawTypes();
        drawNodes();
        drawLinks();
    }

    function drawTypes(){
        types = d3.select(".toolbar.left")
        .selectAll(".type")
        .data(typeArray)
        .enter().append("div")
        .attr("class",function(d){
            return "type "+d;
        });
    }

    function drawNodes(){
        nodes = container
        .selectAll(".node")
        .data(nodesData)
        .enter().append("g")
        .attr("class","node")
        .attr("data-node-id",function(d){return d.name;})
        .attr("transform", function(d){
            return "translate("+d.x+","+d.y+")";
        })
        .classed("hideNode",function(d){
            return !d.dis;
        })
        .attr("data-childrenShown",function(d){
            return d.childrenShown;
        })
        .on("mouseover",nodemouseovered)
        .on("mousemove",nodemousemoved)
        .on("mouseout",nodemouseouted)
        .on("dblclick.dispatch",dispatch.nodeDblclick)
        .call(drag);

        var ele = nodes.append("circle")
        .attr("class",function(d){
           return "node-ele "+"deps-"+d.deps+" "+d.type;
        })
        .attr("data-ele-id",function(d){
            return d.name;
        })
        .attr("r",function(d){
            return calcRadius(d);
        })
        .attr("cx",function(d){
            return calcRadius(d);
        })
        .attr("cy",function(d){
            return calcRadius(d);
        })
        .style("filter", "url(#drop-shadow)");

        var arc = nodes
        .append("path")
        .attr("class",function(d){
            var depsColor = "deps-"+d.deps;
            var nodeType = d.type;
            return "node-arc "+depsColor+" "+nodeType
        })
        .attr("d", function(d){
            var v = {sa:d.sa};
            var depsX = calcRadius(d);
            dataArc.innerRadius(10)
            .outerRadius(depsX);
            return dataArc(v);
        })
        .attr("transform",function(d){
            var depsX = calcRadius(d);
            return "translate("+depsX+","+depsX+")"
        })
        .attr("data-arc-id",function(d){return d.name;})
        .attr("id",function(d){return "data-arc-"+d.name;});

        var text = nodes.append("text")
        .attr("class",function(d){
            var depsColor = "deps-"+d.deps;
            var nodeType = d.type;
            return "node-text "+depsColor+" "+nodeType
        })
        .text(function(d){
            return d.displayName;
        })
        .attr("dx",function(d){
            return calcRadius(d);
        })
        .attr("dy",function(d){
            return calcRadius(d)+5;
        })
        .style("filter", "url(#drop-shadow)");
    }

    function drawLinks(){
        drawLineToLinks();
        drawChildrenLinks();
    }

    function drawLineToLinks(){
        linksL = container
        .selectAll(".linkL")
        .data(linksLineTo)
        .enter()
        .insert("path",".node")
        .attr("class",function(d){
            return (d.source.deps>1||d.target.deps>1)?"link linkL hideLink":"link linkL";
        })
        .attr("source",function(d){
            return d.source.name;
        })
        .attr("target",function(d){
            return d.target.name;
        })
        .attr("type",function(d){
            return d.type;
        })
        .attr("d",function(d){
            var dx1 = calcRadius(d.source);
            var dx2 = calcRadius(d.target);
            var p1 = {},p2={};
            p1.x = d.source.x+dx1;
            p1.y = d.source.y+dx1;
            p2.x = d.target.x+dx2;
            p2.y = d.target.y+dx2;
            return updatePtah(p1,p2,dx1,dx2,d.type);
        })
        .attr("marker-mid",function(d){
            return (d.type=="s"||d.type=="chs")?"":"url(#arrow-two-way)"
        })
        .attr("marker-end",function(d){
            return (d.type=="s"||d.type=="chs")?"url(#arrow-one-way)":""
        })
        .on("mouseover",linkmouseovered).on("mousemove",linkmousemoved).on("mouseout",linkmouseouted);
    }

    function drawChildrenLinks(){
        linksC = container
        .selectAll(".linkC")
        .data(linksChildren)
        .enter()
        .insert("path",".node").attr("class","link linkC hideLink")
        .attr("source",function(d){
            return d.source.name;
        })
        .attr("target",function(d){
            return d.target.name;
        })
        .attr("type",function(d){
            return d.type;
        })
        .attr("d",function(d){
            var dx1 = calcRadius(d.source);
            var dx2 = calcRadius(d.target);
            var p1 = {},p2={};
            p1.x = d.source.x+dx1;
            p1.y = d.source.y+dx1;
            p2.x = d.target.x+dx2;
            p2.y = d.target.y+dx2;
            return updatePtah(p1,p2,dx1,dx2,d.type);
        })
        .attr("marker-end","url(#arrow-one-way)")
        .on("mouseover",linkmouseovered).on("mousemove",linkmousemoved).on("mouseout",linkmouseouted);
    }

    function drawParentLinks(ldata,sname){
        container
        .selectAll(".link-"+sname)
        .data(ldata)
        .enter()
        .insert("path",".node").attr("class","link linkL")
        .attr("source",function(d){
            return d.source.name;
        })
        .attr("target",function(d){
            return d.target.name;
        })
        .attr("type",function(d){
            return d.type;
        })
        .attr("d",function(d){
            var dx1 = calcRadius(d.source);
            var dx2 = calcRadius(d.target);
            var p1 = {},p2={};
            p1.x = d.source.x+dx1;
            p1.y = d.source.y+dx1;
            p2.x = d.target.x+dx2;
            p2.y = d.target.y+dx2;
            return updatePtah(p1,p2,dx1,dx2,d.type);
        })
        .attr("marker-end",function(d){
            return "url(#arrow-one-way)"
        })
        .on("mouseover",linkmouseovered).on("mousemove",linkmousemoved).on("mouseout",linkmouseouted);
    }

    function showChildren(d,node){
        node.on("dblclick.dispatch",null);
        var ldata = [];
        var cx = d.x;
        var cy = d.y;

        d3.selectAll("[source="+d.name+"][type=c]").each(function(eleData,i){
            var link = d3.select(this);
            var type = link.attr("type");
            var targetStr = link.attr("target");

            var childNum = 6//用于控制每圈的数量;
            var nodeDis = config.childrenDis;//子节点距离父节点的距离
            if(i<=5){
                childNum = 6;
                nodeDis = config.childrenDis;
            } else if(i>5&&i<=17){
                childNum = 12;
                nodeDis = config.childrenDis*1.8;
            } else{
                childNum=24;
                nodeDis = config.childrenDis*2.6;
            }



            var currChild = d3.select("[data-node-id="+targetStr+"]");
            var currChildData = currChild.data()[0];
            var childrenDis = calcRadius(d);
            var childR = calcRadius(currChildData)
            var a = i/childNum*Math.PI*2;

            var x = nodeDis*Math.cos(a) + cx + childrenDis - childR;
            var y = nodeDis*Math.sin(a) + cy + childrenDis - childR;


            var chx = config.childrenDis*1.8*Math.cos(a) + cx + childrenDis;
            var chy = config.childrenDis*1.8*Math.sin(a) + cy + childrenDis;

            if(currChildData.deps<=2){
                currChildData.x = x;
                currChildData.y = y;
                currChild.attr("transform","translate("+x+","+y+")");

                link.attr("d",function(){
                    var dx1 = calcRadius(d);
                    var dx2 = calcRadius(currChildData);
                    var p1 = {},p2={};
                    p1.x = d.x+dx1;
                    p1.y = d.y+dx1;
                    p2.x = currChildData.x+dx2;
                    p2.y = currChildData.y+dx2;
                    return updatePtah(p1,p2,dx1,dx2,type);
                });
            }


            if(currChildData.children.length>0){
                currChildData.children[0].x = chx;
                currChildData.children[0].y = chy;
                var grandson = d3.select("[data-node-id="+currChildData.children[0].name+"]");
                var grandsonData = grandson.data()[0];
                var garndsonLink = d3.select("[target="+grandsonData.name+"][type=c]");
                garndsonLink.attr("d",function(){
                    var dx1 = calcRadius(currChildData);
                    var dx2 = calcRadius(grandsonData);
                    var p1 = {},p2={};
                    p1.x = currChildData.x+dx1;
                    p1.y = currChildData.y+dx1;
                    p2.x = grandsonData.x+dx2;
                    p2.y = grandsonData.y+dx2;
                    return updatePtah(p1,p2,dx1,dx2,"c");
                });

                grandson.attr("transform","translate("+chx+","+chy+")");


            }

            currChild.classed("hideNode",false);



            link.classed("hideLink",false);
        });
        d3.selectAll("[source="+d.name+"][type=s]").each(function(eleData,i){
            var link = d3.select(this);
            link.classed("hideLink",true);
            var targetStr = link.attr("target");
            var ldata = [];
            var children = d3.select(this).data()[0].source.children;
            for(var l=0;l<children.length;l++){
                var child = children[l];
                var linkdata = {};
                if(child.deps==2){
                    linkdata.source = nodesDataMap[child.name];
                    linkdata.target = nodesDataMap[targetStr];
                    linkdata.type = "p";
                    ldata.push(linkdata);
                }
            }
            drawParentLinks(ldata,d.name);

        });

        d3.selectAll("[source="+d.name+"][type=chs]").each(function(eleData,i){
            var link = d3.select(this);
            link.classed("hideLink",true);
            var targetStr = link.attr("target");
            var ldata = [];
            var children = d3.select(this).data()[0].source.children;
            for(var l=0;l<children.length;l++){
                var child = children[l];
                var linkdata = {};
                if(child.deps==2&&child.lineTo.length>0){
                    child.lineTo.map(function(dc,ic){
                        linkdata.source = nodesDataMap[child.name];
                        linkdata.target = nodesDataMap[dc.node.name];
                        linkdata.type = "p";
                        ldata.push(linkdata);
                    })

                }
            }
            drawParentLinks(ldata,d.name);

        });

        node.on("dblclick.dispatch",dispatch.nodeDblclick);
    }

    function hideChildren(d,node){
        node.on("dblclick.dispatch",null);
        d3.selectAll("[source="+d.name+"][type=c]").each(function(eleData,i){
            var link = d3.select(this);
            var type = link.attr("type");
            var targetStr = link.attr("target");
            var currChild = d3.select("[data-node-id="+targetStr+"]");
            link.classed("hideLink",true);
            currChild.classed("hideNode",true);
            var currChildChildrenShown = currChild.attr("data-childrenShown");
            if(currChild.data()[0].children.length>0&&currChildChildrenShown=="true"){
                dispatch.nodeDblclick.apply(currChild,currChild.data());
            };
        });

        d3.selectAll("[source="+d.name+"][type=s],[source="+d.name+"][type=chs]").each(function(eleData,i){
            var link = d3.select(this);
            link.classed("hideLink",false);
            var targetStr = link.attr("target");
            var ldata = [];
            var children = d3.select(this).data()[0].source.children;
            for(var l=0;l<children.length;l++){
                var child = children[l];
                d3.selectAll("[source="+child.name+"][type=p]").remove();
            }
        })

        node.on("dblclick.dispatch",dispatch.nodeDblclick);
    }

    d3.select("#reset").on("click",function(){
        var nodesStringData = {};
        $.each(nodesDataMap,function(k,v){
            if(v.deps<=1){
                nodesStringData[k] = {
                    "name":nameMapRe[k],
                    "x":v.x,
                    "y":v.y
                }
            }

        })
        console.log(JSON.stringify(nodesStringData));

        var toScale = 1;
        zoom.scale(toScale);
        zoom.translate([0,0]);

        var tmstr = container.attr("transform");
        if(tmstr==null)return;
        var trstr = tmstr.substring(0,tmstr.indexOf(")")+1);
        trstr = "translate(0,0)"
        container
        .transition()
        .attr("transform", trstr+"scale("+toScale+")");


    })


    var isDone = false;
    /*d3.select("#showtab_1").on("click",function(){
        var ele = d3.select("#data-arc-dataBase_13");
        if(isDone==true){
            arcDataReset(ele);
        } else {
            arcDataLoaded(ele);
        }
    })*/

    function arcDataLoaded(ele){
        var eled = ele.data()[0];
        var depsX = calcRadius(eled);


        ele.transition()
        .duration(2000)
        .attrTween("d", function(d){
            var i = d3.interpolate({sa:d.sa}, {sa:Math.PI*2});
            return function(t) {
                dataArc
                .innerRadius(20)
                .outerRadius(depsX);
                return dataArc(i(t));
            };
        });

        d3.select("path[source=database-1][target=partment-a]").classed("linkD",true);

        isDone = true;
    }

    function arcDataReset(ele){
        var eled = ele.data()[0];
        var depsX = calcRadius(eled);


        ele.transition()
        .duration(2000)
        .attrTween("d", function(d){
            var i = d3.interpolate({sa:Math.PI*2}, {sa:d.sa});
            return function(t) {
                dataArc
                .innerRadius(20)
                .outerRadius(depsX);
                return dataArc(i(t));
            };
        });

        d3.select("path[source=database-1][target=partment-a]").classed("linkD",false);

        isDone = false;
    }



    $("button[data-show]").on("click",function(e){
        $(this).attr("data-show","1");
        var data_num = $(this).attr("data-table-num");
        $(".data-table[data-table-num="+data_num+"]").fadeIn(50);
    });

    $("button.close[data-table-num]").on("click",function(e){
        var data_num = $(this).attr("data-table-num");
        $("button[show-data][data-table-num="+data_num+"]").attr("data-show","0");
        $(".data-table[data-table-num="+data_num+"]").fadeOut(50);
    });


    function showAinBG(btn,w,h,pos,showTabCb){
        var btnWidth = btn.width();
        var btnHeight = btn.height();
        var btnLeft = btn.offset().left;
        var btnTop = btn.offset().top;

        var toleft = "";
        var totop = "";
        switch(pos){
            case "tl":
            toleft = "10px";
            totop = "50px";
            break;
            case "bl":
            toleft = "10px";
            totop = $("body").height() - h - 50 + "px";
            break;
            case "tr":
            toleft = $("body").width() - w - 10 + "px";
            totop = "50px";
            break;
            case "br":
            toleft = $("body").width() - w - 10 + "px";
            totop = $("body").height() - h - 50 + "px";
            break;
        }

        $(".ain-bg").css({
            "top":btnTop+"px",
            "left":btnLeft+"px",
            "width":btnWidth+"px",
            "height":btnHeight+"px",
            "display":"block"
        }).animate({
            "top":totop,
            "left":toleft,
            "width":w+"px",
            "height":h+"px"
        },300,function(){
            $(this).fadeOut(300);
            showTabCb(totop,toleft);
        });

    }

    function testnodemouseovered(){
        var lineToStr = "";
        var node = d3.select("[data-node-id=partment_0]");
        var name = node.data()[0].name;
        node.classed("nodehover",true);
        d3.selectAll(".canvas>*:not([data-node-id="+name+"])").style("opacity","0.1");

        /*
        * linkst 会执行动画 从源到目标
        * linkts 会执行动画 从目标到源
        */

        //所有source是当前节点的线加上class linkst
        d3.selectAll("[source="+d.name+"]").each(function(eled,elei){
            var type = d3.select(this).attr("type");
            var targetName = d3.select(this).data()[0].target.name;

            d3.select("[data-node-id="+targetName+"]").style("opacity","1");
            d3.select(this).style("opacity","1");
            if(type!="c"){
                d3.select(this).classed("linkhover linkst",true);
            }
        })

        //所有target是当前节点且是双向线的link 加上class linkts
        d3.selectAll("[target="+d.name+"]").each(function(eled,elei){
            var type = d3.select(this).attr("type");
            var sourceName = d3.select(this).data()[0].source.name;

            d3.select("[data-node-id="+sourceName+"]").style("opacity","1");
            d3.select(this).style("opacity","1");
            if(type=="s"){d3.select(this).classed("linkhover linkst",true);}
            else if(type=="d"){d3.select(this).classed("linkhover linkts",true);}

        })
    }

    $("#test").click(function(){
        testnodemouseovered();
    })


    init();
})();
