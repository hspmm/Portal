import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormArray , FormControl, FormBuilder, Validators } from '@angular/forms'; 
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { PortalServicesService } from '../../../Services/portal-services.service';
import { MatConfirmDialogComponent } from '../mat-confirm-dialog/mat-confirm-dialog.component';

@Component({
  selector: 'app-edit-product-page',
  templateUrl: './edit-product-page.component.html',
  styleUrls: ['./edit-product-page.component.scss']
})
export class EditProductComponent implements OnInit {
  popup: any = {
    status: true,
    message: '',
    show: false,
  };

  ProductList: Array<any> = [];
  EditProduct: FormGroup;
  addFeatureArray:any;

  constructor(private dialog: MatDialog,private formBuilder: FormBuilder,private PortalServices: PortalServicesService, public dialogRef: MatDialogRef<EditProductComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.EditProduct = this.formBuilder.group({
      Id:new FormControl(''),
      ProductName: new FormControl('',Validators.compose([Validators.required,Validators.pattern('^[_A-z0-9]*((-|\s)*[ ]*[_A-z0-9])*$')])),
      ProductUid:  new FormControl('',Validators.compose([Validators.required,Validators.pattern('^[_A-z0-9]*((-|\s)*[ ]*[_A-z0-9])*$')])),
      Version: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^(?:(0\\.|([1-9]+\\d*)\\.))+((0|([1-9]+\\d*)))$')])),
      Description: new FormControl('', Validators.compose([Validators.required])),
      featureList : this.formBuilder.array([])

    });

  }
  
  FeatureList(): FormGroup {
    return this.formBuilder.group({
      FeatureID:  new FormControl('',Validators.compose([Validators.required,Validators.pattern('^[_A-z0-9]*((-|\s)*[ ]*[_A-z0-9])*$')])),
      FeatureName: new FormControl('',Validators.compose([Validators.required, Validators.pattern('^[_A-z0-9]*((-|\s)*[ ]*[_A-z0-9])*$')])),
      Description: new FormControl('',Validators.required),
     });
  }
  featureList(): FormArray {
    return this.EditProduct.get("featureList") as FormArray
  }
  addItem(): void {
    this.featureList().push(this.FeatureList());
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
        console.log('index is ', index);
        this.featureList().removeAt(index)
      }
    });
  }

  ngOnInit() {
    
    console.log('this.data.rowData.FeatureList',this.data.rowData.featureList);
    this.EditProduct.patchValue(this.data.rowData);
    for(let j=0;j< this.data.rowData.featureList.length; j++){
      this.featureList().push(this.FeatureList());
     
    }
     this.EditProduct.controls.featureList.setValue(this.data.rowData.featureList)
  }

  isDisable(): boolean {

    if (this.EditProduct.valid  && this.popup.status == true) {
      return false;
    }
    else {
      return true;

    }
  }
  keyup(event) {
        this.popup.status = true;
        this.popup.show= false;
        console.log('feature list array is ', this.featureList().value.length);
    for (let j = 0; j < this.featureList().length-1 ; j++) {
      if (this.featureList().value[j].FeatureID === event) {
        console.log("reached here");
        this.popup.show = true;
        this.popup.message ='*Feature ID Already In Use!'
        this.popup.status = false;
      }
    }
  }


  updatePrduct(){
    
    const json = this.EditProduct.value;
    this.PortalServices.editProduct( json, (result, err) => {
      if (err) {
        this.popup.show = true;
        this.popup.message = err.error.message;
        this.popup.status = false;   
        setTimeout(() => {
          this.popup.show = false;
          this.popup.status = true
        }, 3000);
      } else {
        this.dialogRef.close(json);
      }
    })
  }



  cancel() {
    this.dialogRef.close();
  }





}
