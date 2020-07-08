import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PortalServicesService } from '../../../Services/portal-services.service';
import { AssertNotNull } from '@angular/compiler';
import { SearchCountryField, TooltipLabel, CountryISO } from 'ngx-intl-tel-input';
@Component({
  selector: 'app-edit-customer-page',
  templateUrl: './edit-customer-page.component.html',
  styleUrls: ['./edit-customer-page.component.scss']
})
export class EditCustomerPageComponent implements OnInit {

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
  public EditCustomer: FormGroup;
  showSpinner = false
  CertificateUploaded: boolean = false;
  CertificateMissing = false;
  CertificateName = false;
  CertificateEvent: any;
  uploadSuccess = false;
  CertificateError: boolean = false;
  CertificateSizeError: boolean = false;
  CustomerList: any;
  constructor(private PortalServices: PortalServicesService, public dialogRef: MatDialogRef<EditCustomerPageComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.EditCustomer = new FormGroup({
      CustomerID: new FormControl(),
      NodeName: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[_A-z0-9]*((-|\s)*[ ]*[_A-z0-9])*$')])),
      EmailID: new FormControl('', Validators.compose([Validators.required, Validators.email])),
      Telephone: new FormControl('', Validators.compose([Validators.required])),
      DomainName: new FormControl('', Validators.compose([Validators.required, Validators.pattern("^[a-zA-Z0-9\-\.]+\.(com|org|net|COM|ORG|NET)$")])),
      CertificatePath: new FormControl(),
      CertificateName: new FormControl(''),
      isCA: new FormControl(''),
      CertificateValidity: new FormControl('')

    })
  }

  ngOnInit() {
    console.log('edit value from node edit', this.data.rowData);
    this.CertificateName = true;
    console.log('phone value is ', this.data.rowData.Telephone.countryCode)
    this.EditCustomer.patchValue(this.data.rowData)
    this.EditCustomer.controls.Telephone.setValue(this.data.rowData.Telephone.number);
    if (this.data.rowData.CertificatePath === '') {
      this.CertificateMissing = true;

      setTimeout(() => {
        this.CertificateMissing = false
      }, 5000)


    }

  }
  onCertificateSelected(event) {
    this.CertificateSizeError = false;
    this.CertificateError = false;
    this.CertificateUploaded = false;
    console.log(event);
    const [DeviceCertificatefile] = event.target.files
    console.log("file is ", DeviceCertificatefile);
    this.CertificateEvent = event.target.files[0];
    const reader = new FileReader();
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
        console.log(reader.result);
        const certData = reader.result;
        this.uploadSuccess = true;
        const Certjson = {
          formData: certData
        };
        this.PortalServices.CertificateValidate(Certjson, (result, err) => {
          if (err) {
            this.CertificateError = true;
            this.showSpinner = false;

          } else {
            console.log("Certificate Validate Successfully", result);
            this.EditCustomer.controls.CertificatePath.setValue(Certjson);
            this.EditCustomer.controls.isCA.setValue(result.Data.isCA)
            this.EditCustomer.controls.CertificateValidity.setValue(result.Data.validTo)
            this.EditCustomer.controls.CertificateName.setValue(result.Data.CertificateName)
            this.showSpinner = false;

            this.CertificateName = true;
            this.CertificateUploaded = true;
            this.CertificateMissing = false;

            setTimeout(() => {
              this.CertificateUploaded = false
            }, 3000)
          }
        })

      };
    }
  }
  save() {
    if(this.EditCustomer.controls.CustomerID.value !=null){
    const json = {
      formData: this.EditCustomer.value,
    };

    this.PortalServices.UpdateCustomer(json, (result, err) => {
      if (err) {
        this.popup.show = true;
        this.popup.message = err.error.Message;
        this.popup.status = false;
        setTimeout(() => {
          this.popup.show = false;
        }, 5000);

      } else {
        this.dialogRef.close(json);
      }
    })
  }else{
    this.popup.show = true;
    this.popup.message = 'Customer ID Is Not Available';
    this.popup.status = false;
    setTimeout(() => {
      this.popup.show = false;
    }, 5000);

    return;
  }
}
  cancel() {
    this.dialogRef.close();
  }

}
