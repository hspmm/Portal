import { Injectable } from '@angular/core';
import { HttpClient , HttpHeaders, HttpInterceptor,  HttpEvent, HttpHandler, HttpRequest} from '@angular/common/http';
import { PortalServicesService } from '../Services/portal-services.service';
import { Observable } from 'rxjs';

@Injectable()
export class ServiceInterceptor implements HttpInterceptor {

  constructor(private auth: PortalServicesService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> 
    {
      //console.log("@@@@@@@HTTP INTERCEPTER:",req);
      if(this.auth.getAuthorizationToken()){
        const authToken = this.auth.getAuthorizationToken();
        req = req.clone({
            setHeaders: {
                Accesstoken : authToken,
                'Content-Type': 'application/json'
            }
        });
      }

    req = req.clone({ body: undefined });

    console.log("@@@@@@@HTTP INTERCEPTER:",req);
    return next.handle(req);
  }
  
  
}