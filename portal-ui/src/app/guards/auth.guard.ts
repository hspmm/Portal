import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanLoad, Route , Router, CanActivate} from '@angular/router';
import { Observable } from 'rxjs';

import { PortalServicesService } from '../Services/portal-services.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad, CanActivate {
  constructor(private authService: PortalServicesService, private router: Router){ }

  canLoad(): boolean {

    //return true;
    //console.log("Guard:",this.authService.currentUserData)
    if(this.authService.currentUserData && this.authService.currentUserData.mappedPrivileges && this.authService.currentUserData.mappedPrivileges.length > 0){
      return true;
    }else if (this.authService.currentUserData && this.authService.currentUserData.mappedPrivileges && this.authService.currentUserData.mappedPrivileges.length < 1){
      console.log("COMING TO ELSE IF")
         this.router.navigate(['/not-found'])
      // this.authService.logout();
      //this.router.navigate(['']);
      //return true
      return false;
    }else{
      console.log("AFTER COMING TO ELSE IF")
      this.authService.logout();
      return false;
    }
  }


  canActivate(){

    //this.router.navigate(['/dashboard']);
    //return true;

    if(this.authService.currentUserData){
      this.router.navigate(['/dashboard']);
      return true;
    }    
    return true;
  }

}
