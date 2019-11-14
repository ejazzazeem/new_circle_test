import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormsModule, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
@Component({
  selector: 'app-save-report-dialog',
  templateUrl: './save-report-dialog.component.html',
  styleUrls: ['./save-report-dialog.component.scss']
})
export class SaveReportDialogComponent implements OnInit {

  model: any = {
    reportName : '',
    emails: [],
    frequency: '0',
    day: ''
  };
  emailValidators = [this.email];
  isEdit = false;
  constructor(public dialogRef: MatDialogRef<SaveReportDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    const myReport = JSON.parse(localStorage.getItem('MyReport'));

    if (myReport === null || myReport === undefined) {
      const emailAddress = localStorage.getItem('userEmail');
      if (emailAddress) {
        this.model.emails.push(emailAddress);
      }
    } else {
      this.isEdit = true;
      this.model.reportName = myReport.userReportName;
      if (myReport.emailTo !== '' && myReport.emailTo !== null) {
        const emails = myReport.emailTo.split(',');
        this.model.emails = emails;
      }


      switch (myReport.scheduleType) {
        case 'DAILY': this.model.frequency = 1; break;
        case 'WEEKLY': this.model.frequency = 2; break;
        case 'WEEK_INTERVAL': this.model.frequency = 3; break;
        case 'BIWEEKLY': this.model.frequency = 3; break;
        case 'MONTHLY': this.model.frequency = 4; break;
      }
      if (myReport.weekDays.length > 0) {
        this.model.day = myReport.weekDays[0].day;
      } else {
        this.model.day = '';
      }

    }


  }

  validateForm() {
    if (this.model.frequency === '0' || this.model.frequency === 0) {
      return false ;
    } else {
      if ( this.model.frequency === 3 || this.model.frequency === 2 ) {
        if (this.model.day === '' || this.model.emails.length === 0) {
          return true;
        }
    }
    return (this.model.emails.length ===0) ? true : false;
    }

  }

  onYesClick() {
    const obj: any = {};
    obj.reportName = this.model.reportName;
    this.dialogRef.close(this.model);
  }

  onCancelClick(): void {
    this.dialogRef.close('');
  }
  email(control: AbstractControl): ValidationErrors|null {
    return /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/.test(control.value) ? null : {'email': true};
  }

}
