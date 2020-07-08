import { Component, OnInit } from '@angular/core';
import { PortalServicesService } from '../../../Services/portal-services.service';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-single-instance',
  templateUrl: './single-instance.component.html',
  styleUrls: ['./single-instance.component.scss']
})
export class SingleInstanceComponent implements OnInit {
  plugin
  loadedPlugin:boolean = true
  currentUser
  singleInstancePluginUrl
  licensePluginInfo
  Nodeinfo


  constructor(public authService:PortalServicesService, private sanitizer : DomSanitizer) { 

    this.currentUser = this.authService.currentUserData ? this.authService.currentUserData : ''
    console.log("currentUser:",this.currentUser)
    this.authService.isselectedPluginUrl.subscribe(jsonData=>{
      console.log("USer data:",jsonData)
      this.Nodeinfo = jsonData
      let pluginInfo = jsonData.singleInstanceAppInfo
      //this.rootNodeInfo = jsonData.rootNodeInfo
      this.plugin = pluginInfo
      console.log('plugin is')
      let url = pluginInfo.BaseUrl + ':' + pluginInfo.UiPort + JSON.parse(pluginInfo.UiUrls).home
      this.sanitizer.bypassSecurityTrustResourceUrl(url)
      this.singleInstancePluginUrl =  this.sanitizer.bypassSecurityTrustResourceUrl(url)
    })

    this.authService.getLicensemanagerPlugin((licensePluginInfo,err)=>{
      if(err){
        console.log("Error while getting the license manager info")
      }else{
        console.log('information of license  manager is ',  licensePluginInfo.data);
        this.licensePluginInfo = licensePluginInfo.data
      }
    })
  }
  ngOnInit() {
  }

  onLoadSuccess(pluginFrameUrl, $event){
    console.log("pluginFrameUrl:",pluginFrameUrl);
    let url = pluginFrameUrl.changingThisBreaksApplicationSecurity;
    var iframe = document.getElementById('pluginiframe');
    this.loadedPlugin = false;
    console.log("Onload url:",url);
    console.log(this.currentUser.sessionId);
    if (iframe == null) return;
    var iWindow = (<HTMLIFrameElement>iframe).contentWindow;
    setTimeout(()=>{
      if(this.licensePluginInfo && (this.plugin.Name == this.licensePluginInfo.Name)){
        console.log('this is here in license node ');
        // iWindow.postMessage({accesstoken:this.currentUser.sessionId, custID: this.Nodeinfo.rootNodeInfo.Uid},url)
        iWindow.postMessage({accesstoken:this.currentUser.sessionId, custID: this.Nodeinfo.rootNodeInfo.Uid, custName : this.Nodeinfo.rootNodeInfo.NodeName},url)
       }else{
        iWindow.postMessage({accesstoken:this.currentUser.sessionId}, url);
      }
    },1000)
  }


  
  onIframeLoadError(event){
    console.log("Error of loading plugin", event)
  }

}
