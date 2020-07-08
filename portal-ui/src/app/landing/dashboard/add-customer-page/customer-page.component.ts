import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PortalServicesService } from '../../../Services/portal-services.service';
import { SearchCountryField, TooltipLabel, CountryISO } from 'ngx-intl-tel-input';
@Component({
  selector: 'app-customer-page',
  templateUrl: './customer-page.component.html',
  styleUrls: ['./customer-page.component.scss']
})


export class CustomerPageComponent implements OnInit {

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];



  popup: any = {
    status: true,
    message: '',
    show: false,
  };
  copyCustomerID: any;
  submitted = false;
  CustomerList: Array<any> = [];
  showSpinner = false;
  CertificateName = false;
  CertificateUploaded: boolean = false;
  CertificateEvent: any;
  uploadSuccess = false;
  CertificateError: boolean = false;
  CertificateSizeError: boolean = false;
  Updated: boolean = true;
  public AddCustomer: FormGroup;
  constructor(private PortalServices: PortalServicesService, public dialogRef: MatDialogRef<CustomerPageComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.AddCustomer = new FormGroup({
      CustomerID: new FormControl(''),
      NodeName: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[_A-z0-9]*((-|\s)*[ ]*[_A-z0-9])*$')])),
      EmailID: new FormControl('', Validators.compose([Validators.required, Validators.email])),
      Telephone: new FormControl(undefined, [Validators.required]),
      DomainName: new FormControl('', Validators.compose([Validators.required, Validators.pattern("^[a-zA-Z0-9]+\.(com|org|net|COM|ORG|NET)$")])),
      CertificatePath: new FormControl(''),
      isCA: new FormControl(''),
      CertificateValidity: new FormControl(''),
      CertificateName: new FormControl('')
    })
  }

  ngOnInit() {
    this.PortalServices.getCutsomerGUID((result, err) => {
      if (err) {
        console.log("Error in generating GUID ", err);
        
        this.popup.show = true;
        this.popup.message = 'Error in generating GUID';
        this.popup.status = false;
        setTimeout(() => {
          this.popup.show = false;
        }, 5000);

      } else {
        console.log("The Customer GUID  come from  Databse", result.GUID);
        this.AddCustomer.controls.CustomerID.setValue(result.GUID);

        this.copyCustomerID = result.GUID;
        console.log("copyCustomerID is", this.copyCustomerID);

      }
    })
  }

  get Telephone() {
    return this.AddCustomer.get('Telephone');
  }


  isDisable(): boolean {

    if (this.AddCustomer.valid) {
      return false;
    }
    else {
      return true;

    }
  }
  onCertificateSelected(event) {
    
    this.CertificateSizeError = false;
    this.CertificateError = false;
    this.CertificateUploaded = false;
      this.showSpinner = true
      console.log("crtificate is *********", event);
      const [DeviceCertificatefile] = event.target.files
      console.log("file is ", DeviceCertificatefile);
      this.CertificateEvent = event.target.files[0];
      const reader = new FileReader();
      // tslint:disable-next-line: align
      if (event.target.files && event.target.files.length) {
        for (var i = 0; i < event.target.files.length; i++) {
          var size = event.target.files[i].size;
          console.log('*********Size:' + Math.round(size / 1024) + 'KB');
          var SizeinKB = Math.round(size / 1024);
          if (SizeinKB  > 50) {
            this.CertificateSizeError = true;
            this.showSpinner = false;
            return;
          }
        }
        reader.readAsDataURL(DeviceCertificatefile);
        reader.onload = () => {
          const certData = reader.result;
          this.uploadSuccess = true;
          const Certjson = {
            formData: certData
          };
          this.PortalServices.CertificateValidate(Certjson, (result, err) => {
            if (err) {
              this.AddCustomer.reset();
              this.AddCustomer.controls.CustomerID.setValue(this.copyCustomerID);
              this.CertificateError = true;
             

            } else {
              console.log("Certificate Validate Successfully", result);
              this.AddCustomer.controls.isCA.setValue(result.Data.isCA)
              this.AddCustomer.controls.CertificateValidity.setValue(result.Data.validTo)
              this.AddCustomer.controls.CertificateName.setValue(result.Data.CertificateName)
              this.AddCustomer.controls.CertificatePath.setValue(result.Data.CertificatePath)

              this.showSpinner = false;
              this.CertificateUploaded = true;
              this.CertificateName = true;

              setTimeout(() => {
                this.CertificateUploaded = false
              }, 3000)

              console.log('its Device cert data is', Certjson, '+++++++++++++', certData);

            }
          })

        };
      }
    }
  

  save() {
    if(this.AddCustomer.controls.CustomerID.value!= null && this.AddCustomer.controls.NodeName.value !=null){
    const json = {
      formData: this.AddCustomer.value,
    };

    console.log("Add customer form data ", json);
    this.PortalServices.AddCustomer(json, (result, err) => {
      if (err) {
        this.AddCustomer.reset();
        this.AddCustomer.controls.CustomerID.setValue(this.copyCustomerID);

        this.popup.show = true;
        this.popup.message = err.error.Message;
        this.popup.status = false;
        setTimeout(() => {
          this.popup.show = false;
        }, 5000);

      } else {
        console.log('Data of this Page:', json);
        this.dialogRef.close(json);
      }
    })
  }else{
    this.popup.show = true;
    this.popup.message = 'Customer ID Not Found';
    this.popup.status = false;
    setTimeout(() => {
      this.popup.show = false;
    }, 5000);

    return
  }
}
  cancel() {
    this.dialogRef.close();
  }

}
