import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
//import { HttpClientModule } from '@angular/common/http'
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './material-module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { LandingComponent } from './landing/landing.component';
//import { DashboardComponent } from './landing/dashboard/dashboard.component';
import { APP_INITIALIZER } from '@angular/core';

import { NotFoundComponent } from './not-found/not-found.component';
//import {AuthGuard} from './guards/auth.guard';

import { AppConfig} from './app.config';
import { PortalServicesService } from './Services/portal-services.service';


import { ServiceInterceptor } from './interceptors/service-interceptor';
import { AuthGuard } from './guards/auth.guard';

/** Http interceptor providers in outside-in order */
export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: ServiceInterceptor, multi: true },
];

export function initializeApp(appConfig: AppConfig){
  return() => appConfig.load();
}
@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    NotFoundComponent,
    //DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,MaterialModule,ReactiveFormsModule ,FormsModule,HttpClientModule
  ],
  providers: [
    AuthGuard,
    AppConfig, 
    {
      provide: APP_INITIALIZER, 
      useFactory: initializeApp , 
      deps: [AppConfig], 
      multi: true
    },
    PortalServicesService,
    httpInterceptorProviders,
  ],
    bootstrap: [AppComponent]
})
export class AppModule { }
