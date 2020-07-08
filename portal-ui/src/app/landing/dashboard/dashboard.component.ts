import { Component, OnInit, Injectable, HostListener } from '@angular/core';
import { MatDialog, MatTreeNestedDataSource } from '@angular/material';
import { CustomerPageComponent } from 'src/app/landing/dashboard/add-customer-page/customer-page.component';
import { FormGroup, FormControl } from '@angular/forms';
import { NestedTreeControl } from '@angular/cdk/tree';
import { BehaviorSubject } from 'rxjs';
import { PortalServicesService } from '../../Services/portal-services.service';
import { EditCustomerPageComponent } from './edit-customer-page/edit-customer-page.component';
import { DomSanitizer} from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppLocalStorageKeys } from '../../app-storagekeys-urls';
export class Customer {
  TypeName: any;
  TypeOf: any;
  CustomerID: any;
  NodeName: string;
  ParentID: null;
  children?: Customer[];
  EmailID: any;
  Telephone: any;
  DomainName: any;
  CertificatePath: any;
  isCA: any;
  CertificateValidity: any;
  CertificateName: any;
  NodeInfo: any;
}

@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<Customer[]>([]);
  get data(): Customer[] { return this.dataChange.value; }
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [ChecklistDatabase]
})

export class DashboardComponent implements OnInit {


  popup: any = {
    status: false,
    message: '',
    show: false,
  };
  treeControl = new NestedTreeControl<Customer>(node => node.children);
  dataSource = new MatTreeNestedDataSource<Customer>();
  showButton: boolean = true;
  selectedNode: Customer;
  public childData: any;
  public addCustomer: FormGroup;
  public NodeDetailsForm: FormGroup;
  public FacilityForm: FormGroup;
  expandTreeView: boolean = true
  SearchNotFound: boolean = false;
  isCustomerName: boolean = true;
  isNodeName: boolean = false;
  isFacility: boolean = false;
  leftPanColumn = 3
  rightPanColumn = 9
  public addCustomerTable;
  addCustomerArray: Array<any> = [];
  addCustomerArray1: Array<any> = [];
  showError = false;
  hierarchyLevelSettings: any;
  searchedHierarchyList = [];
  showHierarchyTree: boolean = true;
  showSearchList: boolean = true;
  detectedPlugins
  // showDetectedPluginData: boolean;
  splitDirection = 'horizantal'
  searchText: any;
  isTree: boolean = false;
  showSpinner:boolean = true;
  userPrivileges:any ;
  AppLocalKeys = AppLocalStorageKeys()

  constructor(private dialog: MatDialog, private PortalServices: PortalServicesService, private sanitizer: DomSanitizer, private router: Router) {
    this.NodeDetailsForm = new FormGroup({
      NodeName: new FormControl(''),
      Typeof: new FormControl('')
    });
    this.FacilityForm = new FormGroup({
      FacilityName: new FormControl(""),
      AddressLine1: new FormControl(""),
      AddressLine2: new FormControl(""),
      AddressLine3: new FormControl(""),
      City: new FormControl(""),
      State: new FormControl(""),
      PostalCode: new FormControl(""),
      Country: new FormControl(""),
      IPRange: new FormControl(""),
      Status: new FormControl(''),
      Contact: new FormControl(""),
      Email: new FormControl(""),
      Department: new FormControl(""),
      Phone: new FormControl(""),
    });
  }

  hasChild = (_: number, node: Customer) => !!node.children && node.children.length > 0;


  assignPrivileges(){
    this.userPrivileges = {
      addAndEditCustomer : this.PortalServices.checkPrivilege(this.AppLocalKeys.privileges.canAddAndEditCustomerAndProduct).length > 0,
      canViewCustomer: this.PortalServices.checkPrivilege(this.AppLocalKeys.privileges.canViewCustomer).length > 0,
    } 
  }


  expandCollpaseTree() {
    this.expandTreeView = !this.expandTreeView
    if (this.expandTreeView) {
      this.leftPanColumn = 3
      this.rightPanColumn = 9
    } else if (!this.expandTreeView) {
      this.leftPanColumn = 1
      this.rightPanColumn = 11
    }
  }
  addCustomerProfile() {
    this.showError = false;
    const dialogRef = this.dialog.open(CustomerPageComponent, {
      width: '900px'
      // height: '350px'
    })
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.popup.show = true;
        this.popup.message = 'Customer Added Successfully';
        this.popup.status = true;
        setTimeout(() => {
          this.popup.show = false;
        }, 5000);

        this.addCustomerTable = result.formData;
        this.addCustomerArray.push(this.addCustomerTable);
        this.addCustomerArray1.push(this.addCustomerTable);
        this.dataSource.data = this.addCustomerArray1;
        console.log("data source of data ", this.dataSource.data);
        this.userSelectedNode(this.dataSource.data[0]);
      }
    });
  }



  EditCustomerProfile() {
    console.log("node is in edit customer  ", this.selectedNode);
    var selectedNodeData = {
      CustomerID: this.selectedNode.CustomerID,
      NodeName: this.selectedNode.NodeName,
      EmailID: this.selectedNode.EmailID,
      Telephone: this.selectedNode.Telephone,
      DomainName: this.selectedNode.DomainName,
      CertificatePath: this.selectedNode.CertificatePath,
      CertificateName: this.selectedNode.CertificateName,
      isCA: this.selectedNode.isCA,
      CertificateValidity: this.selectedNode.CertificateValidity,
    }
    const dialogRef = this.dialog.open(EditCustomerPageComponent, {
      width: '900px',
      data: {
        rowData: selectedNodeData
      }
    })
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Data from Add Integration  in edit customer  ', result.formData);
        this.getCustomerList();
        this.popup.show = true;
        this.popup.message = 'Customer Updated Successfully';
        this.popup.status = true;
        setTimeout(() => {
          this.popup.show = false;
        }, 5000);
      }
    })
    // height: '350px'
  }

  saveAsJSON() {

    this.PortalServices.getFileData(this.selectedNode.CustomerID, (result, err) => {
      if (err) {
        this.popup.show = true;
        this.popup.message = 'Error in Downloading  Generate Key File';
        this.popup.status = false;
      } else {
        
        this.popup.show = true;
        this.popup.message = 'Generate key file Downloaded Successfully';
        this.popup.status = true;
      }
    })

  }
  downloadFile(json, fileName, contentType) {
    let link = document.createElement("a");
    var file = new Blob([json], { type: contentType });
    link.download = fileName;
    link.href = URL.createObjectURL(file);
    link.click();
  }

  userSelectedNode(node: Customer) {
    this.isTree = true;
    console.log("Selected Node:", node)
    this.isFacility = false;
    this.selectedNode = node
    var parentId = node.ParentID
    if (node.ParentID == null) {
      this.showButton = false
      this.isCustomerName = true;
      this.isNodeName = false;
      this.NodeDetailsForm.controls.NodeName.setValue(node.NodeName);
      this.NodeDetailsForm.controls.Typeof.setValue('Enterprise');


    }
    else {
      this.showButton = true;
      this.isCustomerName = false;
      this.isNodeName = true;

      if (node.TypeOf === "0") {
        this.isFacility = true;
        this.FacilityForm.setValue(JSON.parse(node.NodeInfo))
      }
      this.NodeDetailsForm.controls.NodeName.setValue(node.NodeName);
      this.NodeDetailsForm.controls.Typeof.setValue(node.TypeName);


    }

  }
  searchInHierarchy(text) {
    console.log("text in Serch Node", text);
    if (text) {
      this.searchedHierarchyList = []
      this.showHierarchyTree = false
      this.showSearchList = true
      this.dataSource.data.forEach(list => {
        if (list.NodeName.toLowerCase().indexOf(text.toLowerCase()) != -1) {
          this.SearchNotFound = false;
          this.searchedHierarchyList.push(list)
          console.log("this.searchedHierarchyList.push(list) is", this.searchedHierarchyList);
        }
      });
      if (this.searchedHierarchyList[0] == undefined) {
        
        this.SearchNotFound = true;
      }

    } else {
      this.showHierarchyTree = true
      this.showSearchList = false
    }

  }

  selectedTreeNode(list) {
    console.log("in selected tree node ", list);
    let selectedLevelNode = this.dataSource.data.findIndex(levelNode => {
      return levelNode.NodeName == list.NodeName;
    })
    console.log("selectedLevelNode IBNDEX:", selectedLevelNode)
    this.selectedNode = this.dataSource.data[selectedLevelNode]
    this.showHierarchyTree = true
    this.showSearchList = false
    this.searchText = ''
  }


  RefreshTree() {
    
    this.getCustomerList();
    this.popup.show = true;
    this.popup.message = 'Hierarchy Refreshed Successfully';
    this.popup.status = true;
    setTimeout(() => {
      this.popup.show = false;
    }, 3000);
  }

  getCustomerList() {
    this.PortalServices.getCustomerList((result, err) => {
      if (err) {
        this.showSpinner = false
        this.popup.show = true;
        this.popup.message = 'Error in getCustomerList API';
        this.popup.status = false;
        setTimeout(() => {
          this.popup.show = false;
        }, 3000);
      } else {
        console.log("The Customer List come from  Databse", result);
        this.addCustomerArray1 = result;
        console.log('addcustomerArray 1->', this.addCustomerArray1);
        this.addCustomerArray1 = result.sort(function (node1, node2) {
          if (node1.NodeID < node2.NodeID) {
            console.log('node1.NodeID',node1.NodeID);
          return -1;
          } else if (node1.NodeID > node2.NodeID) {
            
            console.log('node2.NodeID',node2.NodeID);
          return 1;
          } else {
          return 0;
          }
          });
          console.log('after addcustomerArray 1->', this.addCustomerArray1);




        this.dataSource.data = this.addCustomerArray1;
        this.showSpinner = false
        console.log('this.addCustomerArray1', this.addCustomerArray1);
        if (this.dataSource.data[0]) {
          this.userSelectedNode(this.dataSource.data[0]);

        }

      }
    });
  }

  ngOnInit() {

    window.addEventListener('storage', (event) => {
      if (event.storageArea == localStorage) {
        let token = localStorage.getItem('accessToken');
        if (token == undefined) {
          this.router.navigate(['']);
        }
      }
    });




    if (document.documentElement.clientWidth < 768) { // 768px portrait
      this.splitDirection = 'vertical'
    }
    window.onresize = () => {
      if (document.documentElement.clientWidth < 768) { // 768px portrait
        this.splitDirection = 'vertical'
      } else {
        this.splitDirection = 'horizantal'
      }
    };
    
    this.assignPrivileges()
    this.getCustomerList();
    this.getPlugins();
    console.log("this.selectedNode:", this.selectedNode);

  }

  getPlugins() {
    this.PortalServices.getDetectedPluginsList((detectedPlugins, err) => {
      if (err) {
        console.log("Error while geting the detected Plugins:", err);
        this.detectedPlugins = []
      } else {
        console.log("Successfully detected Plugins:", detectedPlugins);
        if (detectedPlugins && detectedPlugins.data && detectedPlugins.data.length > 0) {
          this.detectedPlugins = detectedPlugins.data;
        }
      }
    })
  }

  renderPluginUrl(iconUrl) {

    if (iconUrl) {
      iconUrl = 'data:image/png;base64,' + iconUrl
      return this.sanitizer.bypassSecurityTrustResourceUrl(iconUrl);
    } else {
      return iconUrl = 'assets/icon/default-icon.png'
    }
  }

  selectedSingleInstanceApplication(singleInstanceApp) {
    console.log("singleInstanceApp:", singleInstanceApp)
    let jsonData = {
      singleInstanceAppInfo: singleInstanceApp
    }
    this.PortalServices.selectedPlugin.next(jsonData);
    this.router.navigate(['dashboard/app'], { skipLocationChange: true });

  }


  selectedLicensePluginApplication(singleInstanceApp) {
    console.log("singleInstanceApp:", singleInstanceApp, 'Customer iD is ', this.selectedNode.CustomerID)
    let jsonData;
    if (this.selectedNode.ParentID == null) {
      jsonData = {
        singleInstanceAppInfo: singleInstanceApp,
        rootNodeInfo: {
          NodeID: 1,
          NodeInfo: null,
          NodeName: this.selectedNode.NodeName,
          NodeType: "enterprise-hierarchy",
          ParentID: null,
          PluginID: null,
          TypeOf: "enterprise-configurator",
          Uid: this.selectedNode.CustomerID,
          expandable: false,
          level: 0
        }

      }
    } else {
      jsonData = {
        singleInstanceAppInfo: singleInstanceApp,
        rootNodeInfo: null
      }

    }

    this.PortalServices.selectedPlugin.next(jsonData);
    this.router.navigate(['dashboard/app'], { skipLocationChange: true });
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    window.location.reload();
  }
}
