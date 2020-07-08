import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { LandingRoutingModule } from './landing.routing.module';
//import {LandingComponent} from './landing.component';
import { MaterialModule } from '../material-module'

import { DashboardComponent } from './dashboard/dashboard.component';
import {CustomerPageComponent} from './dashboard/add-customer-page/customer-page.component';
import {EditCustomerPageComponent} from './dashboard/edit-customer-page/edit-customer-page.component';
import { LandingComponent } from './landing.component';
import { PluginInstancePipe } from '../pipes/plugin-instance.pipe';
import {ProductComponent} from './dashboard/products/products.component';

import {AddProductComponent} from './dashboard/add-product-page/add-product-page.component';
import {EditProductComponent} from './dashboard/edit-product-page/edit-product-page.component';

import { AngularSplitModule } from 'angular-split';

//import { PluginInstancePipe } from '../pipes/plugin-instance.pipe'
// import { SafeUrlPipe } from '../pipes/safe-url.pipe'
//import { DynamicFormComponent } from './hierarchy-dashboard/dynamic-form/dynamic-form.component';
import { SingleInstanceComponent } from './dashboard/single-instance/single-instance.component';
import { AboutComponent } from './dashboard/about/about.component';
import { MatConfirmDialogComponent } from './dashboard/mat-confirm-dialog/mat-confirm-dialog.component';

import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
@NgModule({
  declarations: [
    LandingComponent,
    DashboardComponent,
    CustomerPageComponent,
    EditCustomerPageComponent,
    SingleInstanceComponent,
    AboutComponent,
    ProductComponent,
    AddProductComponent,
    EditProductComponent,
    PluginInstancePipe,
    MatConfirmDialogComponent   
  ],
  imports: [
    CommonModule,
    LandingRoutingModule,
    MaterialModule,
    FormsModule, 
    NgxIntlTelInputModule,
    ReactiveFormsModule,
    AngularSplitModule.forRoot()
    
  ],
  entryComponents: [
      CustomerPageComponent,
      AddProductComponent,
      EditProductComponent,
      EditCustomerPageComponent,
      MatConfirmDialogComponent
      
  ]
})
export class LandingModule { }
