var config = {
    width:"100%",
    height:"100%",
    useStaticDat:true,
    serviceUrl:"http://121.12.250.200:8086/framework_web/portal/index/",
    serviceApi:{
        getAllData:{
            url:"js/nodeDataTest.js"
        },
        setAllData:{
            url:""
        },
        getUpdata:{
            url:"getPushData.jhtml"
        },
        getTableData:{
            url:"getTableData.jhtml"
        }
    },
    /*
    link类型
    s单向线
    chs由子节点形成的单向线
    d双向线
    chd由子节点形成的双向线
    p父子节点之间的线
    */
    linkType:{
        s:"s",
        chs:"chs",
        d:"d",
        chd:"chd",
        p:"p"
    },
    //自动布局时节点离中心的半径
    partmentDis:150,
    nodeDis:400,
    childrenDis:100
}