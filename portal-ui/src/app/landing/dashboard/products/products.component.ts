import { Component, OnInit, ViewChild, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { PortalServicesService } from '../../../Services/portal-services.service';
import { MatDialog, MatSnackBar, MatTreeFlattener, MatTreeFlatDataSource, MatTreeNestedDataSource } from '@angular/material';
import { AddProductComponent } from '../add-product-page/add-product-page.component';
import { EditProductComponent } from '../edit-product-page/edit-product-page.component';
import { MatConfirmDialogComponent } from '../mat-confirm-dialog/mat-confirm-dialog.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { AppLocalStorageKeys } from '../../../app-storagekeys-urls';
@Component({
  selector: 'app-prodcuts',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ProductComponent implements OnInit {
  // @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild('outerSort', { static: true }) sort: MatSort;
  @ViewChildren('innerSort') innerSort: QueryList<MatSort>;
  @ViewChildren('innerTables') innerTables: QueryList<MatTable<FeatureList>>;

  // _filterChange = new BehaviorSubject('');
  dataSource: MatTableDataSource<any>;
  usersData = [];
  columnsToDisplay = ['ProductName', 'ProductUid', 'Description', 'Version', 'actions'];
  innerDisplayedColumns = ['FeatureID', 'FeatureName', 'Description'];
  expandedElement;
  detectedProducts = [];
  singleProduct;
  showError = false;
  userPrivileges:any ;
  AppLocalKeys = AppLocalStorageKeys()

  popup: any = {
    status: false,
    message: '',
    show: false,
  };
  rowData: any;

  constructor(private dialog: MatDialog, private authService: PortalServicesService, private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.getDetectedProductList();
    this.assignPrivileges();
  }

  assignPrivileges(){
    this.userPrivileges = {
      addAndEditProduct : this.authService.checkPrivilege(this.AppLocalKeys.privileges.canAddAndEditCustomerAndProduct).length > 0
    } 
  }


  getDetectedProductList() {
    this.usersData = [];
    this.dataSource = new MatTableDataSource(this.usersData);
    this.authService.getDetectedProductList((detectedProducts, err) => {
      if (err) {
        console.log("Error while geting the detected Plugins in about page:", err);
        this.popup.show = true;
        this.popup.message = 'Error in Loading Products';
        this.popup.status = false;
        setTimeout(() => {
          this.popup.show = false;
        }, 5000);
        //this.getAppConfigInfo()
        //this.detectedPlugins = []

      } else {
        console.log("Successfully detected Plugins in about page:", detectedProducts);
        // this.detectedPlugins = detectedPlugins
        //this.getHierarchyList(detectedPlugins.data)

        this.detectedProducts = detectedProducts;
        detectedProducts.forEach(user => {
          if (user.FeatureList && Array.isArray(user.FeatureList)) {
            this.usersData = [...this.usersData, { ...user, FeatureList: new MatTableDataSource(user.FeatureList) }];
          } else {
            this.usersData = [...this.usersData];
          }
        });
        this.dataSource = new MatTableDataSource(this.usersData);
        this.dataSource.sort = this.sort;
      }
    })
  }

  toggleRow(element) {
    element.FeatureList && (element.FeatureList as MatTableDataSource<FeatureList>).data.length ? (this.expandedElement = this.expandedElement === element ? null : element) : null;
    this.cd.detectChanges();
    this.innerTables.forEach((table, index) => (table.dataSource as MatTableDataSource<FeatureList>).sort = this.innerSort.toArray()[index]);
  }

  applyFilter(filterValue: string) {
    this.innerTables.forEach((table, index) => (table.dataSource as MatTableDataSource<FeatureList>).filter = filterValue.trim().toLowerCase());
  }

  addProduct() {

    this.showError = false;
    //console.log("show err", this.showError);
    const dialogRef = this.dialog.open(AddProductComponent, {
      width: '900px',
      disableClose: true
      // height: '350px'
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Data from Add Integration  ', result);
        this.singleProduct = result;
        // this.detectedProducts.push(this.singleProduct);
        console.log("addCustomerArray1 is", this.detectedProducts);
        this.detectedProducts.push(this.singleProduct);
        this.getDetectedProductList();
        this.popup.show = true;
        this.popup.message = 'Product  Added Successfully';
        this.popup.status = true;
        setTimeout(() => {
          this.popup.show = false;
        }, 5000);
      }
    });

  }

  deleteProduct(index: number) {
    const dialogRef = this.dialog.open(MatConfirmDialogComponent, {
      data: {
        Message: '		Are You Sure To Delete This Product'
      },
      disableClose: true
      // height: '350px'
    })
    dialogRef.afterClosed().subscribe((result) => {
      console.log('delete result is ', result);
      if (result) {
        let productData = this.detectedProducts[index];
        this.authService.deleteProduct(productData, (result, err) => {
          if (err) {
            console.log("Error in Deletion of prouct API", err);
            this.popup.show = true;
            this.popup.message = '!!Error Product Not Deleted ';
            this.popup.status = false;
            setTimeout(() => {
              this.popup.show = false;
            }, 5000);
          } else {
            console.log("The Customer List come from  Databse", result);
            this.getDetectedProductList();
            this.popup.show = true;
            this.popup.message = 'Product  Deleted Successfully ';
            this.popup.status = true;
            setTimeout(() => {
              this.popup.show = false;
            }, 5000);
          }
        })
      }
    });
    // this.detectedProducts.splice(index, 1);
  }



  editProduct(index: number) {
    console.log('value for edit Product', this.detectedProducts[index]);
    this.rowData = {
      Id: this.detectedProducts[index].Id,
      ProductName: this.detectedProducts[index].ProductName,
      ProductUid: this.detectedProducts[index].ProductUid,
      Version: this.detectedProducts[index].Version,
      Description: this.detectedProducts[index].Description,
      featureList: this.detectedProducts[index].FeatureList
    };

    console.log('row data', this.rowData);
    const dialogRef = this.dialog.open(EditProductComponent, {
      width: '900px',
      data: {
        rowData: this.rowData,
        disableClose: true
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Data from Add Facility ', result);
        this.getDetectedProductList();
        this.popup.show = true;
        this.popup.message = 'Product Updated  Successfully ';
        this.popup.status = true;
        setTimeout(() => {
          this.popup.show = false;
        }, 5000);
        console.log(index);
        // this.detectedProducts[index].push(result.formData);
        console.log('fieldarray1', this.detectedProducts);
      }

    });
  }
}
export interface FeatureList {
  FeatureID: string;
  FeatureName: string;
  Description: string;
}