import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router) { }

  ngOnInit() { }

  onYesClick(componentName): void {
    switch (componentName) {
      case 'AddUserComponent':
        this.dialogRef.close();
        this.router.navigate(['/admin/userManagement/']);
        break;
      case 'ViewAllUsersComponent':
        this.data.option = 'yes';
        this.dialogRef.close(this.data.option);
        break;
      case 'AddGroupComponent':
        this.dialogRef.close();
        this.router.navigate(['/admin/groupManagement']);
        break;
      case 'ViewAllGroupsComponent':
        this.data.option = 'yes';
        this.dialogRef.close(this.data.option);
        break;
      case 'AddPayerComponent':
        this.dialogRef.close();
        this.router.navigate(['/admin/payerManagement']);
        break;
      case 'PayerDetailsComponent':
        this.data.option = 'yes';
        this.dialogRef.close(this.data.option);
        break;
      case 'ManagerComponent':
        this.data.option = 'yes';
        this.dialogRef.close(this.data.option);
        break;
      case 'ReportComponent':
        this.data.option = 'yes';
        this.dialogRef.close(this.data.option);
        break;
      default:
        this.dialogRef.close();
        break;
    }

  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
