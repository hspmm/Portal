import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AppLocalStorageKeys } from '../app-storagekeys-urls';
import { BehaviorSubject, Observable } from 'rxjs';
import { saveAs } from 'file-saver';
// import { ResponseContentType} from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class PortalServicesService {


  AppConfiggurations = AppConfig.settings.env
  sessionExpiry = false
  serverDown = false





  public selectedPlugin: BehaviorSubject<any> = new BehaviorSubject<any>('');

  public loggedIn: BehaviorSubject<any> = new BehaviorSubject<any>('');

  get isselectedPluginUrl() {
    return this.selectedPlugin.asObservable();
  }

  get isLoggedIn() {
    return this.loggedIn.asObservable()
  }

  baseURL = AppConfig.settings.env.baseURL;
  localKeys = AppLocalStorageKeys();

  getAuthorizationToken() {
    return localStorage.getItem(AppLocalStorageKeys().accessToken)
  }


  get currentUserData() {
    return JSON.parse(localStorage.getItem(this.localKeys.currentUser)) ? JSON.parse(localStorage.getItem(this.localKeys.currentUser)) : ''
  }
  constructor(private http: HttpClient, private router: Router) {
  }

  AddCustomer(customerData, callback) {
    this.http.post(this.baseURL + this.localKeys.urls.addCustomerUrl, customerData).toPromise().then(result => {
      callback(result);
    }).catch(err => {
      console.log("err is", err);
      callback(null, err);
      this.handleError(err);
    })
  }
  getCustomerList(callback) {
    this.http.get(this.baseURL + this.localKeys.urls.getCustomerListUrl).toPromise().then(result => {
      callback(result);
    }).catch(err => {
      callback(null, err);
      this.handleError(err);
    })
  }
  getCutsomerGUID(callback) {
    this.http.get(this.baseURL + this.localKeys.urls.getGUIDUrl).toPromise().then(result => {
      callback(result);
    }).catch(err => {
      callback(null, err);
      this.handleError(err);
    })
  }

  // logout() {
  //   localStorage.removeItem('accessToken');
  //   localStorage.clear();
  //   window.localStorage.clear();
  //   this.router.navigate(['']);
  // }


  logout(){    
    this.http.delete(this.baseURL +this.localKeys.urls.logoutUrl).toPromise().then(appConfigInfo =>{
      console.log("In service Logout:",appConfigInfo)
    }).catch(err=>{
      console.log("Error Logout:",err)
    })
    this.navigateToLoginPage();
  }

  navigateToLoginPage(){
    console.log("coming to navigate to lo gin page")
    localStorage.setItem(this.localKeys.currentUser, '');
    localStorage.setItem(this.localKeys.accessToken,''); 
    localStorage.clear();
    window.localStorage.clear()
    this.router.navigate(['']);
    // this.router.routeReuseStrategy.shouldReuseRoute=()=>true
  }


  UpdateCustomer(customerData, callback) {
    this.http.post(this.baseURL + this.localKeys.urls.updateCustomerUrl, customerData).toPromise().then(result => {
      callback(result);
    }).catch(err => {
      callback(null, err);
      this.handleError(err);
    })
  }

  getDetectedPluginsList(callback) {
    this.http.get(this.baseURL + this.localKeys.urls.detectPluginsListUrl).toPromise().then(plugins => {
      console.log("In service:", plugins)
      callback(plugins)
    }).catch(err => {
      console.log("Error DETECT:", err);
      callback(null, err);
      this.handleError(err);
    })
  }

  getDetectedProductList(callback) {
    this.http.get(this.baseURL + this.localKeys.urls.detectProductListUrl).toPromise().then(plugins => {
      console.log("In service:", plugins)
      callback(plugins)
    }).catch(err => {
      console.log("Error DETECT:", err);
      callback(null, err);
      this.handleError(err);
    })
  }


  addProduct(productData, callback) {
    this.http.post(this.baseURL + this.localKeys.urls.addProduct, productData).toPromise().then(plugins => {
      console.log("In service:", plugins)
      callback(plugins)
    }).catch(err => {
      console.log("Error DETECT:", err)
      callback(null, err);
      this.handleError(err);
    })

  }


  editProduct(ProductData, callback) {
    this.http.post(this.baseURL + this.localKeys.urls.editProduct, ProductData).toPromise().then(result => {
      callback(result);
    }).catch(err => {
      callback(null, err);
      this.handleError(err);
    })
  }

  deleteProduct(ProductData, callback) {
    this.http.post(this.baseURL + this.localKeys.urls.deleteProduct, ProductData).toPromise().then(result => {
      callback(result);
    }).catch(err => {
      callback(null, err);
      this.handleError(err);
    })
  }


  setPluginServicesEnableAndDisable(json, callback) {
    this.http.put(this.baseURL + this.localKeys.urls.setEnableAndDisablePluginServiceUrl, json).toPromise().then(response => {
      console.log("In service:", response)
      callback(response, null)
    }).catch(err => {
      console.log("Error:", err);
      callback(null, err);
      this.handleError(err);
    })
  }

  restartAllPluginsServices(callback) {
    this.http.get(this.baseURL + this.localKeys.urls.restartAllPluginServices).toPromise().then(response => {
      console.log("In service:", response)
      callback(response, null)
    }).catch(err => {
      console.log("Error:", err);
      callback(null, err);
      this.handleError(err);
    })
  }


  restartIndividualPluginsServices(pluginUid, callback) {
    this.http.get(this.baseURL + this.localKeys.urls.restartIndividualPluginServices + pluginUid).toPromise().then(response => {
      console.log("In service:", response)
      callback(response, null)
    }).catch(err => {
      console.log("Error:", err);
      callback(null, err);
      this.handleError(err);
    })
  }


  login(authObj, callback) {
    console.log("authObj:", authObj)
    this.http.post(this.baseURL + this.localKeys.urls.loginUrl, authObj).toPromise().then(userInfo => {
      localStorage.setItem(this.localKeys.accessToken, userInfo['data'].sessionId);
      let userInfoData = userInfo['data']
      localStorage.setItem(this.localKeys.currentUser, JSON.stringify(userInfoData));
      this.loggedIn.next(userInfoData);
      this.router.navigate(['/dashboard']);
    }).catch(err => {
      console.log("Error :", err)
      callback(null, err);
      this.handleError(err);
    })

  }

  CertificateValidate(CertData, callback) {
    this.http.post(this.baseURL + this.localKeys.urls.CertificateValidateAPI, CertData).toPromise().then(result => {
      callback(result);
    }).catch(err => {
      callback(null, err);
      this.handleError(err);
    })

  }

  getLicensemanagerPlugin(callback) {
    this.http.get(this.baseURL + this.localKeys.urls.getLicensePluginUrl).toPromise().then(resp => {
      callback(resp, null)
    }).catch(err => {
      this.handleError(err)
      callback(null, err)
    })
  }



  getFileData(CustomerId, callback) {
    this.http.get(this.baseURL + this.localKeys.urls.getFileDataAPI + '/' + CustomerId, { responseType: "blob" }).toPromise().then((res) => {
      saveAs(res, "key.json");
      callback(res);
    }).catch(err => {
      callback(null, err);
      this.handleError(err);
    })
  }

  checkPrivilege(appPrivilege){
    if(appPrivilege && this.currentUserData.mappedPrivileges && this.currentUserData.mappedPrivileges.length > 0){
      return this.currentUserData.mappedPrivileges.filter(userPrivileges => userPrivileges.Privilege.Key.toLowerCase() == appPrivilege.toLowerCase())
    }
    return false
  }


  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error);
    } else {

      if (error.error.errCode == "SESS_EXP") {
        window.confirm("Session Expired....!!");
        this.sessionExpiry = true;
        this.logout();
      }

    }
  }

}