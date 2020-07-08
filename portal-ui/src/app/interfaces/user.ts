export interface User{
    userName:string
    password:any
}
export interface NodeCreation{
    NodeName:string
    NodeShortName:string
    ParentID:number
    PluginID:number
    NodeType:string
    TypeOf:string
    PluginInfoId : any
    NodeInfo : string
    CreatedDate:string
    LastModifiedDate:string
    CreatedBy:string
    ModifiedBy:string
    IsActive:number
}

export class TreeFlatNode { //*****Actual tree structure that showing in the UI******
    Id:any;
    NodeName: string;
    NodeID:number;
    ParentID:number;
    PluginID:number;
    NodeType:string;
    TypeOf:string;
    NodeInfo:string;
    icon?:any;
    level: number;
    expandable: boolean;
  }
  
export class TreeNode {  //*****Tree structure that requires to create a tree for TreeFlatNode******
    NodeName: string;
    NodeID?:number;
    Id?:any;
    ParentID?:number;
    PluginID:number;
    NodeType:string;
    TypeOf:string;
    icon?:any;
    NodeInfo?:any;
    typeOfService?:any;
    pluggable?:boolean;
    appUrl?:any
    children?: TreeNode[];
}