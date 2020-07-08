import { Component, OnInit ,Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-mat-confirm-dialog',
  templateUrl: './mat-confirm-dialog.component.html',
  styleUrls: ['./mat-confirm-dialog.component.scss']
})
export class MatConfirmDialogComponent implements OnInit {

  constructor( public dialogRef: MatDialogRef<MatConfirmDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }
  public Message:any;

  ngOnInit() {
    console.log('data in mat conform dialg box', this.data);
    this.Message = this.data.Message;
  }
  
  closeDialog() {
    this.dialogRef.close(false);
  }

}
