import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LandingComponent  } from './landing.component';
import { DashboardComponent} from './dashboard/dashboard.component';
import {SingleInstanceComponent} from './dashboard/single-instance/single-instance.component';
import {AboutComponent} from './dashboard/about/about.component';
import {ProductComponent} from './dashboard/products/products.component';


const routes: Routes = [
  {
    path:'',
    component: LandingComponent,
    children:[
      {
        path:'',
        component: DashboardComponent,
      },
      {
        path:'about',
        component: AboutComponent
      }, 
      {
        path:'app',
        component: SingleInstanceComponent
      },
      {
        path:'products',
        component: ProductComponent
      }
    ]
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule { }
