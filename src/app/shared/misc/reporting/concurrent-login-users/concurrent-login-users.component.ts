import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { AlertService, LoaderService, ReportingService, UtilsService } from '@services/index';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { SaveReportDialogComponent } from '../save-report-dialog';
import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';
import * as moment from 'moment';
@Component({
  selector: 'app-concurrent-login-users',
  templateUrl: './concurrent-login-users.component.html',
  styleUrls: ['./concurrent-login-users.component.scss']
})
export class ConcurrentLoginUsersComponent implements OnInit, OnDestroy {
  private unSubscribe = new Subject();
  showHideTable = false;
  reportName = 'concurrent-logged-users';
  isMyReport = false;
  model: any = {'timePeriod' : '' , selectedIndex: -1};
  results: any;
  noRecordFound = false;
  constructor(private alertService: AlertService,
              private loaderService: LoaderService,
              private reportingService: ReportingService,
              private utils: UtilsService,
              private router: Router,
              public dialog: MatDialog) {
    this.router.routeReuseStrategy.shouldReuseRoute = function() { return false; };
  }

  ngOnInit() {
    this.getReportFiltersFromLocalStorage();
    if (localStorage.getItem('currentTab') !== null && localStorage.getItem('currentTab') !== undefined) {
      this.isMyReport = true;
      this.applyFilter();
    }
  }

  // Set/Get Report Filter to Retain Info on Page Reload - Start ----------------------------------------------
  getReportFiltersFromLocalStorage() {
    // Get Report Data from local storage if available, else set default data for this report
    const reportFilters = JSON.parse(localStorage.getItem('reportDetail'));
    if (!reportFilters || reportFilters.reportName !== this.reportName) {
      // Set Filters in Local Storage to Retain Report Information on Page Reload
      this.setReportFiltersInLocalStorage();
    } else {
      this.model.timePeriod = reportFilters.timePeriod;
    }
  }

  // Set Filters in Local Storage to Retain Report Information on Page Reload
  setReportFiltersInLocalStorage() {
    const reportFilters = {
      reportName: this.reportName,
      timePeriod: this.model.timePeriod
    };
    localStorage.setItem('reportDetail', JSON.stringify(reportFilters));
  }
// Set/Get Report Filter to Retain Info on Page Reload - End ----------------------------------------------

  clearFilter() {
    this.model.timePeriod = '';
    this.model.selectedIndex = -1;
    this.showHideTable = false;
    this.results = null;
  }

  applyFilter() {
    if (this.model.timePeriod === null || this.model.timePeriod === undefined || this.model.timePeriod === '') {
      this.alertService.error('Please select time period');
      return false;
    }
    this.loaderService.display(true);
    this.showHideTable = true;
    this.results = [];

    // Set Filters in Local Storage to Retain Report Information on Page Reload
    this.setReportFiltersInLocalStorage();
    let date = null;
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.reportingService.fetchConcurrentLoggedInUsers(this.model.timePeriod , timeZone)
        .takeUntil(this.unSubscribe).subscribe(
        data => {
         let response =  data as Array<any>;
         for (let i = 0 ; i < response.length; i++) {
              response[i].displayDate = this.getDisplayDate(response[i].dateTime);
         }
          this.results = response;

          if (this.results.length === 0) {
            this.noRecordFound = true;
          } else {
            this.noRecordFound = false;
          }
          this.loaderService.display(false);
        },
        error => {
          this.noRecordFound = false;
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        });
  }
  getDisplayDate(date) {
    return moment(date).format('MM/DD/YYYY hh:mm A');
    //  const d = new Date(date);
    //  const hours = d.getUTCHours();
    //  const formattedHours =  (hours > 12) ? hours - 12 : hours;
    //  const displayHour = formattedHours < 10 ?  '0' + formattedHours.toString() : formattedHours.toString();
    //  const minutes = d.getUTCMinutes();
    //  const displayMinute = minutes < 10 ? '0' + minutes.toString() : minutes;
    //  const span = hours > 11 ? 'PM' : 'AM';
    //  const month = d.getUTCMonth() + 1;
    // return month.toString() + '/' + d.getUTCDate() + '/'  + d.getUTCFullYear() + ' ' + displayHour + ':' + displayMinute + ' ' + span;
  }

  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }


  saveDialog(): void {

    const dialogRef = this.dialog.open(SaveReportDialogComponent);
    dialogRef.afterClosed().takeUntil(this.unSubscribe).subscribe(result => {
      if (result !== '') {
    const reportObj = this.createReportObj(result);
        this.reportingService.addUserReport(reportObj).takeUntil(this.unSubscribe).subscribe(
            data => {
              this.alertService.success('Report added successfully');
              this.loaderService.display(false);
            },
            error => {
              this.loaderService.display(false);
              this.alertService.error(error.error.errors[0].endUserMessage);
            });
      }
    });
  }

  editDialog(): void {
    const dialogRef = this.dialog.open(SaveReportDialogComponent);
    dialogRef.afterClosed().takeUntil(this.unSubscribe).subscribe(result => {
      if (result !== '') {

        let reportObj = this.createReportObj(result);
        const reportId = JSON.parse(localStorage.getItem('MyReport')).userReportId;
        reportObj.userReportId = reportId;
        this.reportingService.updateUserReport(reportId, reportObj).takeUntil(this.unSubscribe).subscribe(
            data => {
              localStorage.setItem('MyReport', JSON.stringify(data));
              this.alertService.success('Subscription Info Updated successfully');
              this.loaderService.display(false);
            },
            error => {
              this.loaderService.display(false);
              this.alertService.error(error.error.errors[0].endUserMessage);
            });
      }
    });
  }

  deleteReport() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to remove this report ?',
        componentName: 'ReportComponent'
      }
    });
    dialogRef.afterClosed().takeUntil(this.unSubscribe).subscribe(result => {
      if (result === 'yes') {
        const reportId = JSON.parse(localStorage.getItem('MyReport')).userReportId;
        this.reportingService.deleteUserReport(reportId).takeUntil(this.unSubscribe).subscribe(
            data => {
              localStorage.removeItem('MyReport');
              localStorage.removeItem('currentReport');
              localStorage.removeItem('reportDetail');
              localStorage.removeItem('currentTab');
              this.alertService.success('Report deleted Successfully');
              this.router.navigated = false;
              this.router.navigate([this.router.url]);



            },
            error => {

              this.alertService.error(error.error.errors[0].endUserMessage);
            });
      }
    });

  }

  createReportObj(result) {
    const userId = JSON.parse(localStorage.getItem('currentUser')).userId;
    const baseReport = JSON.parse(localStorage.getItem('currentReport'));
    const params =  JSON.parse(localStorage.getItem('reportDetail'));
    delete params.reportName;
    const filteredParams: any = {
      timePeriod: ''
    };
    Object.keys(params).forEach(function(key) {
      if (key === 'timePeriod') {
        filteredParams.timePeriod = params[key];
      }
    });
    let scheduleType = '';
    switch (result.frequency) {
      case 1 : scheduleType = 'DAILY'; break;
      case 2 : scheduleType = 'WEEKLY'; break;
      case 3 : scheduleType = 'WEEK_INTERVAL'; break;
      case 4 : scheduleType = 'MONTHLY'; break;
    }
    const dayArray = [];
    if (result.frequency !== 1 && result.frequency !== 4) {
      if (result.day !== null && result.day !== undefined && result.day !== '') {
        dayArray.push({day: result.day});
      }}

    const emails = [];
    if (result.emails.length > 1 ) {
      if (result.emails[0].display) {
        emails.push(result.emails[0].display);
      } else {
        emails.push(result.emails[0]);
      }
      for (let i = 1; i < result.emails.length; i++) {
        if (result.emails[i].display) {
          emails.push(result.emails[i].display);
        } else {
          emails.push(result.emails[i]);
        }
      }
    } else if (result.emails.length === 1 )  {
      if (result.emails[0].display) {
        emails.push(result.emails[0].display);
      } else {
        emails.push(result.emails[0]);
      }
    }

    const reportObj = {
      userReportId: null,
      userId : userId,
      baseReportId: baseReport.baseReportId,
      userReportName: result.reportName,
      filterParams: JSON.stringify( filteredParams),
      weekDays: scheduleType !== '' ? dayArray : null,
      emailTime: scheduleType !== '' ? new Date() : null,
      emailSubscription: scheduleType !== '' ? true : false,
      interval: scheduleType !== '' ? 2 : null,
      emailTo:  emails.join(',') ,
      scheduleType: scheduleType !== '' ? scheduleType : 'NONE'
    };

    return reportObj;
  }


  // downloadReport(e) {
  //   const baseReport = JSON.parse(localStorage.getItem('currentReport'));
  //   let filterParams = {timePeriod: '', timeZone: ''};
  //   filterParams.timePeriod = this.model.timePeriod === null || this.model.timePeriod === undefined ? '' : this.model.timePeriod;
  //   filterParams.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  //   if (e === '1') {
  //     this.reportingService.downloadReportPdf(baseReport, filterParams, this.reportName);
  //   } else {
  //     this.reportingService.downloadReportCSV(baseReport, filterParams, this.reportName);
  //   }
  //
  // }
  downloadReport(e) {
    (e === '1') ? this.print() : this.downloadCSV();
  }

  print() {
    const printContents = document.getElementById('reportDiv').innerHTML;
    setTimeout(this.reportingService.printReport(printContents) , 2000);
  }

  downloadCSV() {
    const headerData = document.getElementsByClassName('collapsible-head')[0];
    const bodyData = document.getElementsByClassName('collapsible-body')[0];
    const csv = this.reportingService.createCsv(headerData, bodyData );
    const fileName = this.reportName + new Date().toISOString() + '.csv';
    this.reportingService.downloadReport(csv, fileName);

  }
}
