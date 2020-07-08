import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { PortalServicesService } from '../Services/portal-services.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  SigninForm: FormGroup
  hide = true
  showSpinner = false
  hidePassword = true

  displayToast = {
    show: false,
    message: '',
    success: false
  }

  constructor(fb: FormBuilder, private router: Router, private authService: PortalServicesService) {
    this.SigninForm = fb.group({
      userName: new FormControl('', Validators.compose([
        Validators.required
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required
      ]))
    })
  }

  ngOnInit() {
  }
  showPassword(mouseEvent) {
    if (mouseEvent) {
      this.hidePassword = false
    } else {
      this.hidePassword = true
    }
  }

  onSubmit(signinForm) {
    let userInfo = this.SigninForm.value;
    let authObj = {
      userDetails: this.SigninForm.value,
      authType: "LDAP"
    }

    this.showSpinner = true;
    this.authService.login(authObj, (response, err) => {
      if (!response) {
        console.log("signin error:", err)
        this.displayToast = {
          show: true,
          message: err.statusText + '..!!',
          success: false
        }
        this.showSpinner = false;
      } else {
        signinForm.resetForm();
        this.showSpinner = false;
      }
    });

  }

  closeToast() {
    this.displayToast.show = false
  }

}
