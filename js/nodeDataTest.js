var nodesStaticData = [
        {
            name:"center",
            displayName:"1",
            parent:"",
            children:[],
            childrenShown:false,
//            lineTo:["partment-a,s","partment-b,s","database-1,s","database-2,s","app-1,s","app-2,s"],
            lineTo:[],
            type:"center",
            deps:0,
            sa:1,
            dis:true,
            x:0,
            y:0
        }
        ,
        {   
            name:"partment-a",
            displayName:"2",
            parent:"",
            children:[],
            childrenShown:false,
            lineTo:["partment-b,d"],
            type:"partment",
            deps:1,
            sa:0.3,
            dis:true,
            x:0,
            y:0
        }
        ,
        {
            name:"partment-b",
            displayName:"3",
            parent:"",
            children:[],
            childrenShown:false,
            lineTo:[],
            type:"partment",
            deps:1,
            sa:1.5,
            dis:true,
            x:0,
            y:0
        }
        ,
        {
            name:"partment-c",
            displayName:"4",
            parent:"",
            children:[],
            childrenShown:false,
            lineTo:["partment-b,s"],
            type:"partment",
            deps:1,
            sa:1.5,
            dis:true,
            x:0,
            y:0
        }
        ,
        {
            name:"partment-d",
            displayName:"5",
            parent:"",
            children:[],
            childrenShown:false,
            lineTo:["partment-b,s"],
            type:"partment",
            deps:1,
            sa:1.5,
            dis:true,
            x:0,
            y:0
        }
        ,
        {
            name:"partment-e",
            displayName:"6",
            parent:"",
            children:[],
            childrenShown:false,
            lineTo:["partment-c,s"],
            type:"partment",
            deps:1,
            sa:1.5,
            dis:true,
            x:0,
            y:0
        }
        ,
        {
            name:"partment-f",
            displayName:"7",
            parent:"",
            children:[],
            childrenShown:false,
            lineTo:["partment-e,s"],
            type:"partment",
            deps:1,
            sa:1.5,
            dis:true,
            x:0,
            y:0
        }
        ,
        {
            name:"partment-g",
            displayName:"8",
            parent:"",
            children:[],
            childrenShown:false,
            lineTo:["partment-f,s"],
            type:"partment",
            deps:1,
            sa:1.5,
            dis:true,
            x:0,
            y:0
        }
        ,
        {
            name:"partment-h",
            displayName:"9",
            parent:"",
            children:[],
            childrenShown:false,
            lineTo:["partment-e,s"],
            type:"partment",
            deps:1,
            sa:1.5,
            dis:true,
            x:0,
            y:0
        }
        ,
        {
            name:"partment-i",
            displayName:"10",
            parent:"",
            children:[],
            childrenShown:false,
            lineTo:["partment-a,s"],
            type:"partment",
            deps:1,
            sa:1.5,
            dis:true,
            x:0,
            y:0
        }
        ,
        {
            name:"database-1",
            displayName:"11",
            parent:"",
            children:[],
            childrenShown:false,
            lineTo:["partment-a,d"],
            type:"dataBase",
            deps:1,
            sa:0.5,
            dis:true,
            x:0,
            y:0
        }
        ,
        {
            name:"database-2",
            displayName:"12",
            parent:"",
            children:[],
            childrenShown:false,
            lineTo:["partment-a,s"],
            type:"dataBase",
            deps:1,
            sa:0.8,
            dis:true,
            x:0,
            y:0
        }
        ,
        {
            name:"database-3",
            displayName:"13",
            parent:"",
            children:[],
            childrenShown:false,
            lineTo:["partment-d,s"],
            type:"dataBase",
            deps:1,
            sa:0.8,
            dis:true,
            x:0,
            y:0
        }
        ,
        {
            name:"database-4",
            displayName:"14",
            parent:"",
            children:[],
            childrenShown:false,
            lineTo:["partment-e,s"],
            type:"dataBase",
            deps:1,
            sa:0.8,
            dis:true,
            x:0,y:0
        }
        ,
        {
            name:"app-1",
            displayName:"15",
            parent:"",
            children:[],
            childrenShown:false,
            lineTo:[],
            type:"app",
            deps:1,
            sa:0,
            dis:true,
            x:0,y:0
        }
        ,
        {
            name:"app-2",
            displayName:"16",
            parent:"",
            children:[],
            childrenShown:false,
            lineTo:["database-4,s"],
            type:"app",
            deps:1,
            sa:0.5,
            dis:true,
            x:0,y:0
        }
        ,
        {   
            name:"data-1",
            displayName:"17",
            parent:"app-1",
            children:[],
            childrenShown:false,
            lineTo:["app-2,s"],
            type:"dataTopic",
            deps:2,
            sa:0.9,
            dis:false,
            x:0,y:0
        }
        ,
        {
            name:"data-2",
            displayName:"18",
            parent:"app-1",
            children:[],
            childrenShown:false,
            lineTo:["app-2,s"],
            type:"dataTopic",
            deps:2,
            sa:1.2,
            dis:false,
            x:0,y:0
        }
        ,
        {
            name:"data-3",
            displayName:"19",
            parent:"app-1",
            children:[],
            childrenShown:false,
            lineTo:["app-2,s"],
            type:"dataTopic",
            deps:2,
            sa:1.2,
            dis:false,
            x:0,y:0
        }
        ,
        {
            name:"data-4",
            displayName:"20",
            parent:"app-1",
            children:[],
            childrenShown:false,
            lineTo:["app-2,s"],
            type:"dataTopic",
            deps:2,
            sa:1.2,
            dis:false,
            x:0,y:0
        }
        ,
        {
            name:"data-5",
            displayName:"21",
            parent:"app-1",
            children:[],
            childrenShown:false,
            lineTo:["app-2,s"],
            type:"dataTopic",
            deps:2,
            sa:1.2,
            dis:false,
            x:0,y:0
        }
        ,
        {   
            name:"data-6",
            displayName:"22",
            parent:"app-2",
            children:[],
            childrenShown:false,
//            lineTo:["app-1,s"],
            lineTo:[],
            type:"dataTopic",
            deps:2,
            sa:0.7,
            dis:false,
            x:0,y:0
        }
        ,
        {
            name:"data-7",
            displayName:"23",
            parent:"app-2",
            children:[],
            childrenShown:false,
            lineTo:[],
            type:"dataTopic",
            deps:2,
            sa:0.5,
            dis:false,
            x:0,y:0
        }
        ,
        {
            name:"data-8",
            displayName:"21",
            parent:"app-1",
            children:[],
            childrenShown:false,
            lineTo:["app-2,s"],
            type:"dataTopic",
            deps:2,
            sa:1.2,
            dis:false,
            x:0,y:0
        }
        ,
        {
            name:"data-9",
            displayName:"21",
            parent:"app-1",
            children:[],
            childrenShown:false,
            lineTo:["app-2,s"],
            type:"dataTopic",
            deps:2,
            sa:1.2,
            dis:false,
            x:0,y:0
        }
        ,
        {
            name:"data-10",
            displayName:"21",
            parent:"app-1",
            children:[],
            childrenShown:false,
            lineTo:["app-2,s"],
            type:"dataTopic",
            deps:2,
            sa:1.2,
            dis:false,
            x:0,y:0
        }
        ,
        {
            name:"data-11",
            displayName:"21",
            parent:"app-1",
            children:[],
            childrenShown:false,
            lineTo:["app-2,s"],
            type:"dataTopic",
            deps:2,
            sa:1.2,
            dis:false,
            x:0,y:0
        }
        ,
        {   
            name:"metadata-1",
            displayName:"24",
            parent:"data-2",
            children:[],
            childrenShown:false,
            lineTo:[],
            type:"dataTopic",
            deps:3,
            sa:0,
            dis:false,
            x:0,y:0
        }
        ,
        {   
            name:"metadata-2",
            displayName:"25",
            parent:"data-3",
            children:[],
            childrenShown:false,
            lineTo:[],
            type:"dataTopic",
            deps:3,
            sa:1,
            dis:false,
            x:0,y:0
        }
    ];