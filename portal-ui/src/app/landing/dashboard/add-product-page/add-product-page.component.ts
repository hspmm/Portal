import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormArray, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { PortalServicesService } from '../../../Services/portal-services.service';
import { MatConfirmDialogComponent } from '../mat-confirm-dialog/mat-confirm-dialog.component';

@Component({
  selector: 'app-add-product-page',
  templateUrl: './add-product-page.component.html',
  styleUrls: ['./add-product-page.component.scss']
})
export class AddProductComponent implements OnInit {

  popup: any = {
    status: true,
    message: '',
    show: false,
  };

  ProductList: Array<any> = [];
  public AddProduct: FormGroup;
  featureList: FormArray;
  sameFeatureId:boolean= false;




  constructor(private dialog: MatDialog,private formBuilder: FormBuilder, private PortalServices: PortalServicesService, public dialogRef: MatDialogRef<AddProductComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {

    this.AddProduct = this.formBuilder.group({
      ProductName: new FormControl('',Validators.compose([Validators.required,Validators.pattern('^[_A-z0-9]*((-|\s)*[ ]*[_A-z0-9])*$')])),
      ProductUid:  new FormControl('',Validators.compose([Validators.required,Validators.pattern('^[_A-z0-9]*((-|\s)*[ ]*[_A-z0-9])*$')])),
      Version: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^(?:(0\\.|([1-9]+\\d*)\\.))+((0|([1-9]+\\d*)))$')])),
      Description: new FormControl('', Validators.compose([Validators.required])),
      featureList: this.formBuilder.array([],)

    });


  }


  FeatureList(): FormGroup {
    return this.formBuilder.group({
      FeatureID:  new FormControl('',Validators.compose([Validators.required,Validators.pattern('^[_A-z0-9]*((-|\s)*[ ]*[_A-z0-9])*$')])),
      FeatureName: new FormControl('',Validators.compose([Validators.required, Validators.pattern('^[_A-z0-9]*((-|\s)*[ ]*[_A-z0-9])*$')])),
      Description: new FormControl('',Validators.required),
    });
  }

  addItem(): void {
    this.featureList = this.AddProduct.get('featureList') as FormArray;
    this.featureList.push(this.FeatureList());
  }


  DeleteFeatureList(index){
    const dialogRef = this.dialog.open(MatConfirmDialogComponent, {
      data:{
        Message: 'Are You Sure To Delete This FeatureList'
      },
      disableClose: true
      // height: '350px'
    })
    dialogRef.afterClosed().subscribe((result) => {
      console.log('delete result is ', result);
      if (result) {
        this.featureList.removeAt(index)
      }
    });
  }




  ngOnInit() {
  }

  isDisable(): boolean {

    if (this.AddProduct.valid && this.popup.show == false) {
      return false;
    }
    else {
      return true;

    }
  }
  keyup(event) {
        this.popup.status = true;
        this.popup.show= false;
        console.log('feature list array is ', this.featureList.value.length);
    for (let j = 0; j < this.featureList.value.length-1 ; j++) {
      if (this.featureList.value[j].FeatureID === event) {
        this.popup.show = true;
        this.popup.message ='*Feature ID Already In Use!'
        this.popup.status = false;
      }
    }
  }

  save() {
    const json = this.AddProduct.value;
    this.PortalServices.addProduct(json, (result, err) => {
      if (err) {
        this.AddProduct.reset();
        this.popup.show = true;
        this.popup.message = err.error.message;
        this.popup.status = false;
        setTimeout(() => {
          this.popup.show = false;
        }, 5000);

      } else {
        console.log('Data of this Page:', json);
        this.dialogRef.close(json);
      }
    })
  }

  cancel() {
    this.dialogRef.close();
  }

}
