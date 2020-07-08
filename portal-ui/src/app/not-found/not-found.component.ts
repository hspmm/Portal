import { Component, OnInit } from '@angular/core';

import { PortalServicesService } from '../Services/portal-services.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {
  user
  constructor(private portalAuthService:PortalServicesService) {
      this.user = this.portalAuthService.currentUserData
     }

  ngOnInit() {
    setTimeout(()=>{
      this.signout()
    },5000);
  }

  signout(){
    this.portalAuthService.logout();
  }

}
