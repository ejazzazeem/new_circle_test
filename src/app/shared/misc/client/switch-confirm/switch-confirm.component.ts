import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


@Component({
  selector: 'app-switch-confirm',
  templateUrl: './switch-confirm.component.html',
  styleUrls: ['./switch-confirm.component.scss']
})
export class SwitchConfirmComponent implements OnInit {

  constructor(
      public dialogRef: MatDialogRef<SwitchConfirmComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
