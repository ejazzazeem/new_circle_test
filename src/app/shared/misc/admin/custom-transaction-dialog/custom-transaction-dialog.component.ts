import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-custom-transaction-dialog',
  templateUrl: './custom-transaction-dialog.component.html',
  styleUrls: ['./custom-transaction-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomTransactionDialogComponent implements OnInit {
 model: any = {};
  showError = false;
  constructor(public dialogRef: MatDialogRef<CustomTransactionDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {

  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {

    if (this.model.customTransactionName !== undefined && this.model.customTransactionName !== null ) {
      this.showError = false;
      this.dialogRef.close(this.model.customTransactionName);
    } else {
      this.showError = true;
    }

  }
  ngOnInit() {
  }

}

