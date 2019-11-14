import { Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { AlertService, LoaderService, ReportingService, UtilsService } from '@services/index';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { SaveReportDialogComponent } from '../save-report-dialog';
import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';
import * as moment from 'moment';
declare function isNumberKey(e, target): any;
declare function isValidDate(e): any;
@Component({
  selector: 'app-active-users',
  templateUrl: './active-users.component.html',
  styleUrls: ['./active-users.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ActiveUsersComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  private unSubscribe = new Subject();
  activeUsers: any = [];
  model: any = {};
  fromDate: Date;
  toDate: Date;
  showHideTable = false;
  reportName = 'active-users';
  isMyReport = false;
  noRecordFound = false;
  paginationObj = {
    pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
  scrollToElement: any;
  sDateErr = false;
  eDateErr = false;
  sdateMsg = '';
  edateMsg = '';
  constructor( private alertService: AlertService,
               private loaderService: LoaderService,
               private reportingService: ReportingService,
               private utils: UtilsService,
               private router: Router,
               public dialog: MatDialog) {
    this.router.routeReuseStrategy.shouldReuseRoute = function() { return false; };
  }

  ngOnInit() {
    // Get report filter from Local storage
    this.getReportFiltersFromLocalStorage();
    if (localStorage.getItem('currentTab') !== null && localStorage.getItem('currentTab') !== undefined) {
      this.isMyReport = true;
      this.requestActiveUsers();
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
      this.model.userId = reportFilters.userId;
      this.model.lastName = reportFilters.lastName;
      this.fromDate = reportFilters.fromDate;
      this.toDate = reportFilters.toDate;
    }
  }

  // Set Filters in Local Storage to Retain Report Information on Page Reload
  setReportFiltersInLocalStorage() {
    const reportDetail = {
      reportName: this.reportName,
      userId: this.model.userId,
      lastName: this.model.lastName,
      fromDate: this.fromDate,
      toDate: this.toDate
    };
    localStorage.setItem('reportDetail', JSON.stringify(reportDetail));
  }
// Set/Get Report Filter to Retain Info on Page Reload - End ----------------------------------------------

  requestActiveUsers() {
    this.loaderService.display(true);
    this.activeUsers = [];
    this.showHideTable = true;
    // Set Filters in Local Storage to Retain Report Information on Page Reload
    this.setReportFiltersInLocalStorage();

    this.activeUsers = this.activeUsers.splice(0, this.activeUsers.length);
    let todate, fromdate;
    if (this.toDate) {
      const _todate =  moment(this.toDate).toISOString();
      todate = moment(_todate).format('YYYY-MM-DD');
    } else {
      todate = null;
    }

    if (this.fromDate) {
      const _fromdate =  moment(this.fromDate).toISOString();
      fromdate = moment(_fromdate).format('YYYY-MM-DD');
    } else {
      fromdate = null;
    }

    this.reportingService.getPagedActiveUsersByDateRange(this.model.userId, this.model.lastName,
        fromdate, todate,this.paginationObj.currentOffSet,  this.paginationObj.pageSize).takeUntil(this.unSubscribe).subscribe(
        data => {
          this.activeUsers = data.results;
          this.paginationObj.totalRecords = data.totalCount;
          this.noRecordFound =  (data.totalCount === 0) ? true : false;
          this.loaderService.display(false);
        }, error => {
          this.noRecordFound = true;
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        }
    );
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  clearFilter() {
    this.activeUsers = [];
    this.toDate = null;
    this.fromDate = null;
    this.model.userId = '';
    this.model.lastName = '';
    this.showHideTable = false;
    this.eDateErr = false;
    this.edateMsg = '';
    this.sdateMsg = '';
    this.sDateErr = false;
    this.paginationObj = {
      pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
    // Set Filters in Local Storage to Retain Report Information on Page Reload
    this.setReportFiltersInLocalStorage();
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

  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }


  createReportObj(result) {
    const userId = JSON.parse(localStorage.getItem('currentUser')).userId;
    const baseReport = JSON.parse(localStorage.getItem('currentReport'));
    const params =  JSON.parse(localStorage.getItem('reportDetail'));
    delete params.reportName;
    const filteredParams: any = {
      userId: '',
      userLastName: '',
      startDate: '',
      endDate: ''
    };
    Object.keys(params).forEach(function(key) {
      if (key === 'userId') {
        filteredParams.userId = params[key];
      } else if (key === 'lastName') {
        filteredParams.userLastName  = params[key];
      } else if (key === 'fromDate') {
        filteredParams.startDate  = params[key];
      } else if (key === 'toDate') {
        filteredParams.endDate  = params[key];
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
  //   let todate, fromdate;
  //   if (this.toDate) {
  //     const _todate =  moment(this.toDate).toISOString();
  //     todate = moment(_todate).format('YYYY-MM-DD');
  //   } else {
  //     todate = '';
  //   }
  //
  //   if (this.fromDate) {
  //     const _fromdate =  moment(this.fromDate).toISOString();
  //     fromdate = moment(_fromdate).format('YYYY-MM-DD');
  //   } else {
  //     fromdate = '';
  //   }
  //   let filterParams = {   userId: '',   userLastName: '',   startDate: '', endDate: '' };
  //   filterParams.userId = this.model.userId === null || this.model.userId === undefined ? '' : this.model.userId;
  //   filterParams.userLastName = this.model.lastName === null || this.model.lastName === undefined ? '' : this.model.lastName;
  //   filterParams.startDate = fromdate;
  //   filterParams.endDate = todate;
  //   if (e === '1') {
  //     this.reportingService.downloadReportPdf(baseReport, filterParams, this.reportName);
  //   } else {
  //     this.reportingService.downloadReportCSV(baseReport, filterParams, this.reportName);
  //   }
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

  updatePageSize(size) {
    this.paginationObj.pageSize = size;
    this.paginationObj.currentOffSet = 0;
    this.requestActiveUsers();
    this.scrollToElement = document.getElementById('reportDiv');
    this.scrollFunction(this.scrollToElement);
  }

  updatePage(event) {
    this.paginationObj.currentOffSet = event;
    this.requestActiveUsers();
    this.scrollToElement = document.getElementById('reportDiv');
    this.scrollFunction(this.scrollToElement);
  }

  scrollFunction(element) {
    this.scrollToElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
  }

  handledate(e) {
    return isNumberKey(e, e.target);
  }
  validateStartDate(e) {
    this.sDateErr = false;
    if (e.target.value !== '') {
      if (!isValidDate(e.target.value)) {
        this.sDateErr = true;
        this.sdateMsg = 'Invalid date.';
      } else {
        this.sDateErr = false;
        this.sdateMsg = '';
      }
    } else {
      this.sDateErr = false;
      this.sdateMsg = '';
    }

  }
  validateEndtDate(e) {
    this.eDateErr = false;
    if (e.target.value !== '') {
      if (isValidDate(e.target.value)) {

        const d = new Date(e.target.value);
        const minDate = new Date(this.fromDate);
        if (d.getTime() < minDate.getTime()) {
          this.eDateErr = true;
          this.edateMsg = 'Date should be greater or equals to start date';
        }  else {
          this.eDateErr = false;
          this.edateMsg = '';
        }
      } else {
        this.eDateErr = true;
        this.edateMsg = 'Invalid date.';
      }
    } else {
      this.eDateErr = false;
      this.edateMsg = '';
    }

  }

}
