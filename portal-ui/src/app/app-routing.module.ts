import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import {AuthGuard} from './guards/auth.guard';
import { NotFoundComponent } from './not-found/not-found.component';





const routes: Routes = [
  {
    path:'',
    component: LoginPageComponent,
    canActivate: [AuthGuard]
  },
    {
    path:'not-found',
    component: NotFoundComponent
  },
  {
    path:'dashboard',
    canLoad : [AuthGuard], 
    loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule)
         
  }
  //{path: '**', redirectTo:'dashboard', pathMatch:'full'}
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
