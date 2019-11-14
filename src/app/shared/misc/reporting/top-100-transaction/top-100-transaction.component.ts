import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AlertService, LoaderService, ReportingService, ViewAllPayersService, UtilsService } from '@services/index';

import { Subject } from 'rxjs/Rx';
declare function isNumberKey(e, target): any;
declare function isValidDate(e): any;
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { SaveReportDialogComponent } from '../save-report-dialog';
import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';
import * as moment from 'moment';
@Component({
  selector: 'app-top-100-transaction',
  templateUrl: './top-100-transaction.component.html',
  styleUrls: ['./top-100-transaction.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class Top100TransactionComponent implements OnInit, OnDestroy {

  model = {
    userPayer: '',
    filterFrom: '',
    filterTo: ''
  };
  maxDate: any;
  minDate: any;

  sortParams = {
    keyword: '',
    sortField: {
      page: {
        offSet: 0,
        size: 1000
      },
      sortField: {
        fieldName: 'name',
        sortOrder: 'ASC'
      }
    }
  };
  payerList: any;
  showHideTable = false;
  customDateCheck: boolean;
  filterTo: Date;
  filterFrom: Date;
  dateMsgFilterFrom: String = null;
  dateMsgFilterTo: String = null;
  dateHours: any = [];
  noRecordFound = false;
  reportName = 'top-100-transaction';
  private unSubscribe = new Subject();
  isMyReport = false;
  sDateErr = false;
  eDateErr = false;
  sdateMsg = '';
  edateMsg = '';
  constructor(private alertService: AlertService,
              private loaderService: LoaderService,
              private utils: UtilsService,
              private reportingService: ReportingService,
              private payersService: ViewAllPayersService,
              private router: Router,
              public dialog: MatDialog) {
    this.router.routeReuseStrategy.shouldReuseRoute = function() { return false; };
  }

  ngOnInit() {
    this.loaderService.display(true);
    // Get report filter from Local storage
    this.getReportFiltersFromLocalStorage();

    this.minDate = new Date(1900, 0, 1); // user cannot select date before 1900
    this.maxDate = new Date(); // user cannot select future date for to date



    this.getAllPayers();

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
      this.model.userPayer = reportFilters.userPayer;
      this.filterFrom = reportFilters.filterFrom;
      this.filterTo = reportFilters.filterTo;
    }
  }

  // Set Filters in Local Storage to Retain Report Information on Page Reload
  setReportFiltersInLocalStorage() {
    const reportDetail = {
      reportName: this.reportName,
      userPayer: this.model.userPayer,
      filterFrom: this.filterFrom,
      filterTo: this.filterTo
    };
    localStorage.setItem('reportDetail', JSON.stringify(reportDetail));
  }
// Set/Get Report Filter to Retain Info on Page Reload - End ----------------------------------------------

  getAllPayers() {
    this.payersService.getAllPayers(this.sortParams).takeUntil(this.unSubscribe).subscribe(
        data => {
          this.payerList = data.results;
          this.loaderService.display(false);
        },
        error => {
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        }
    );
  }

  // date validation
  handledate(e) {
    return isNumberKey(e, e.target);
  }

  // Validate from date
  validateFromDate(e) {
    this.customDateCheck = (this.filterFrom > this.filterTo);
    return this.utils.isValid(e.target.value) ? isValidDate(e.target.value) ?
        new Date(e.target.value).getTime() < new Date('01/01/1900').getTime() ? 'Date should be greater or equals to 01/01/1900' :
            new Date(e.target.value).getTime() > new Date().getTime() ? 'From date cannot be a future date' :
                null : 'Invalid date.' : null;
  }

  // Validate to date
  validateToDate(e) {
    this.customDateCheck = (this.filterFrom > this.filterTo);
    return this.utils.isValid(e.target.value) ? isValidDate(e.target.value) ? this.utils.isValid(this.filterFrom) ?
        new Date(e.target.value).getTime() < new Date(this.filterFrom).getTime() ? 'To date should be greater than from date' :
          new Date(e.target.value).getTime() > new Date().getTime() ? 'To date cannot be a future date' :
              null : 'Please select from date first.' : 'Invalid date.' : null;
  }

  applyFilter() {
    this.loaderService.display(true);
    this.dateHours = [];
    this.showHideTable = true;
    // Set Filters in Local Storage to Retain Report Information on Page Reload
    this.setReportFiltersInLocalStorage();
    let _filterFrom,  _filterTo = null;
    if (this.filterFrom) {
      const _fDate = moment(this.filterFrom).toISOString();
      _filterFrom = moment(_fDate).format('YYYY-MM-DD');
    }
    if (this.filterTo) {
      const _tDate = moment(this.filterTo).toISOString();
      _filterTo = moment(_tDate).format('YYYY-MM-DD');
    }
    console.log(_filterFrom);
    console.log(_filterTo);
    this.reportingService.getTop100TransactionTotal(this.model.userPayer, _filterFrom, _filterTo)
    .takeUntil(this.unSubscribe).subscribe(
        data => {
          this.dateHours = data;
          if (this.dateHours.length === 0) {
            this.noRecordFound = true;
          } else {
            this.noRecordFound = false;
          }
          this.loaderService.display(false);
        },
        error => {
          this.noRecordFound = true;
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        });
  }

  clearFilter() {
    this.dateHours = [];
    this.model.userPayer = '';
    this.filterFrom = null;
    this.filterTo = null;
    this.showHideTable = false;
    this.dateMsgFilterFrom = null;
    this.dateMsgFilterTo = null;
    this.customDateCheck = null;
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


  // unSubscribe the observables to avoid memory leaks
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
      payerName : '',
      startDate : '',
      endDate : '',
    };
    Object.keys(params).forEach(function(key) {
      if (key === 'userPayer') {
        filteredParams.payerName = params[key];
      } else if (key === 'filterFrom') {
        filteredParams.startDate  = params[key];
      } else if (key === 'filterTo') {
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
  //   if (this.filterTo) {
  //     const _todate =  moment(this.filterTo).toISOString();
  //     todate = moment(_todate).format('YYYY-MM-DD');
  //   } else {
  //     todate = '';
  //   }
  //
  //   if (this.filterFrom) {
  //     const _fromdate =  moment(this.filterFrom).toISOString();
  //     fromdate = moment(_fromdate).format('YYYY-MM-DD');
  //   } else {
  //     fromdate = '';
  //   }
  //   let filterParams ={ payerName: '', startDate: '',   endDate: '' };
  //   filterParams.payerName = this.model.userPayer === null || this.model.userPayer === undefined ? '' : this.model.userPayer;
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

}
