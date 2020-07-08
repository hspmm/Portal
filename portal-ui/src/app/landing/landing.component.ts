import { Component, OnInit } from '@angular/core';

import {PortalServicesService} from '../Services/portal-services.service';

import { AppLocalStorageKeys } from '../app-storagekeys-urls';
@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})

export class LandingComponent implements OnInit {
  currentUser;
  headerDropDownContent;
  headerContent;
  public counter = 90
  intervalId;
  router: any;
  ApplocalKeys = AppLocalStorageKeys()
  userPrivileges:any;
  constructor(private  PortalServices: PortalServicesService ) {
    this.assignPrivileges()  
    this.PortalServices.isLoggedIn.subscribe(data=>{
      console.log("USer data:",data);
      this.currentUser = data;
    })
    
    
    this.getHeaderDropDownContent();
    this.getHeaderContent();
   }

  ngOnInit() {
    this.currentUser = this.PortalServices.currentUserData ? this.PortalServices.currentUserData : ''
   
  }

  assignPrivileges(){
    this.userPrivileges = {
      manageProductsAndPlugin : this.PortalServices.checkPrivilege(this.ApplocalKeys.privileges.canViewProductAndPlugins).length > 0
    } 
  }
  
  getHeaderContent(){
    this.headerContent = [
      {
        name:"Home",
        icon:"home",
        link:"",
        hasAccess : true,
        id : "homePageButton"
      },
    ]
  }
  getHeaderDropDownContent(){
    this.headerDropDownContent = [

      {
        name:"Plugins Status",
        icon:"list",
        link:"about",
        id : "pluginStatusPageButton",
        hasAccess : this.userPrivileges.manageProductsAndPlugin ? this.userPrivileges.manageProductsAndPlugin : false
      },

      {
         name: "Product List",
         icon: "list",
         link: "products",
         hasAccess : this.userPrivileges.manageProductsAndPlugin ? this.userPrivileges.manageProductsAndPlugin : false,
         id : "productListPageButton"
       
        }
    ]
  }

  logout(){
    this.PortalServices.logout();
  }


}
