import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-disclaimer',
  templateUrl: './disclaimer-dialog.component.html',
  styleUrls: ['./disclaimer-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DisclaimerDialogComponent implements OnInit {

  model: any = {};
  disclaimerText: any = {};
  groupList = [];
  notEmpty: boolean;
  oneGroup: boolean;
  payerOrGroup: string = null;
  selectedGroup = '';

  constructor(private router: Router,
              public dialogRef: MatDialogRef<DisclaimerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {

      this.model.selectedGroup = data.selectedGroup;
      this.groupList = data.groupList;
      this.oneGroup = data.oneGroup;
      this.notEmpty = data.notEmpty;
      this.disclaimerText = data.disclaimerText;
      this.model.payerOrGroup = data.payerOrGroup;
  }

  ngOnInit() {

  }

  savedGroup (groupId) {
    this.dialogRef.close();
    this.router.navigate(['/client/home']);
    localStorage.setItem('displayDisclaimer', 'false');
    localStorage.setItem('selectedGroup', JSON.stringify(groupId));
  }

  logout() {
    this.dialogRef.close();
    this.router.navigate(['/login']);
    localStorage.removeItem('selectedGroup');
  }

}
