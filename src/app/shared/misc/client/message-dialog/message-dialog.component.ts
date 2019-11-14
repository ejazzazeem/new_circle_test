import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MessageDialogComponent implements OnInit {

  dialogMessage: string;
  dialogColor: string;

  constructor(public dialogRef: MatDialogRef<MessageDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.dialogMessage = data.dialogMessage;
    this.dialogColor = data.dialogColor;
  }

  ngOnInit() {
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
