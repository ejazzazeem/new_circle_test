import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { AlertService, LoaderService, ReportingService, ViewAllPayersService } from '@services/index';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { SaveReportDialogComponent } from '../save-report-dialog';
import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';
declare function isNumberKey(e, target): any;
declare function isValidDate(e): any;
@Component({
  selector: 'app-transaction-hour-averages',
  templateUrl: './transaction-hour-averages.component.html',
  styleUrls: ['./transaction-hour-averages.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TransactionHourAveragesComponent implements OnInit, OnDestroy  {

  showDetails = false;
  showNoRecord = false;
  expandOrCollapse = true;
  response = [];
  payerList: any;
  model: any = {
    payerId: '',
    fromDate: '',
    toDate: '',
    userType: '1'
  };
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
  reportName = 'transaction-hour-averages';
  isMyReport = false;
  private unSubscribe = new Subject();
  noresponse = false;
  sDateErr = false;
  eDateErr = false;
  sdateMsg = '';
  edateMsg = '';
  constructor(private alertService: AlertService,
              private loaderService: LoaderService,
              private reportingService: ReportingService,
              private payersService: ViewAllPayersService,
              private router: Router,
              public dialog: MatDialog) {
    this.router.routeReuseStrategy.shouldReuseRoute = function() { return false; };
  }

  ngOnInit() {
    this.getAllPayers();

    // Get report filter from Local storage
    this.getReportFiltersFromLocalStorage();
    if (localStorage.getItem('currentTab') !== null && localStorage.getItem('currentTab') !== undefined) {
      this.isMyReport = true;
      this.applyFilter();
    }
  }

  getReportFiltersFromLocalStorage() {
    // Get Report Data from local storage if available, else set default data for this report
    const reportFilters = JSON.parse(localStorage.getItem('reportDetail'));
    if (!reportFilters || reportFilters.reportName !== this.reportName) {
      // Set Filters in Local Storage to Retain Report Information on Page Reload
      this.setReportFiltersInLocalStorage();
    } else {
      this.model.payerId = reportFilters.payerId;
      this.model.fromDate = reportFilters.fromDate;
      this.model.toDate = reportFilters.toDate;
      this.model.userType = reportFilters.userType;
    }
  }

// Set Filters in Local Storage to Retain Report Information on Page Reload
  setReportFiltersInLocalStorage() {
    const reportFilters = {
      reportName: this.reportName,
      payerId: this.model.payerId,
      fromDate: this.model.fromDate,
      toDate: this.model.toDate,
      userType: this.model.userType
    };
    localStorage.setItem('reportDetail', JSON.stringify(reportFilters));
  }

  getAllPayers() {
    this.payersService.getAllPayers(this.sortParams).takeUntil(this.unSubscribe).subscribe(
        data => {
          this.payerList = data.results;
        },
        error => {
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        }
    );
  }

  setSelectedIndex(index) {
    if (this.model.selectedIndex !== index) {
      this.model.selectedIndex = index;
    } else {
      this.model.selectedIndex = -1;
    }

  }
  applyFilter() {
    this.response = [];
    this.showDetails = true;
    // Set Filters in Local Storage to Retain Report Information on Page Reload
    this.setReportFiltersInLocalStorage();

    this.loaderService.display(true);
    let _filterFrom, _filterTo = null;
    if (this.model.fromDate) {
      const _fdate = moment(this.model.fromDate).toISOString();
      _filterFrom = moment(_fdate).format('YYYY-MM-DD');
    }
    if (this.model.toDate) {
      const _tdate = moment(this.model.toDate).toISOString();
      _filterTo = moment(_tdate).format('YYYY-MM-DD');
    }
    this.reportingService.getTransactionHourAverages(this.model.payerId, _filterFrom, _filterTo, this.model.userType)
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          this.response = data;
          if (this.response.length === 0) {
            this.noresponse = true;
          } else {
            this.noresponse = false;
          }
          this.loaderService.display(false);
        },
        error => {
          this.noresponse = true;
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        });
  }


  clearFilter() {
    this.showDetails = false;
    this.model.payerId = '';
    this.model.fromDate = '';
    this.model.toDate = '';
    this.model.userType = '1';
    this.edateMsg = '';
    this.sdateMsg = '';
    this.eDateErr = false;
    this.sDateErr = false;
    this.response = [];
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
        reportObj.userReportId =  reportId;
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

  getLocalTimeHour(hour) {
    const localHour = new Date();
    localHour.setUTCHours(hour);
    return localHour.getHours();
  }

  createReportObj(result) {
    const userId = JSON.parse(localStorage.getItem('currentUser')).userId;
    const baseReport = JSON.parse(localStorage.getItem('currentReport'));
    const params =  JSON.parse(localStorage.getItem('reportDetail'));
    delete params.reportName;
    const filteredParams: any = {
      payerId : '',
      startDate : '',
      endDate : '',
      userType: '',
    };
    Object.keys(params).forEach(function(key) {
      if (key === 'payerId') {
        filteredParams.payerId = params[key];
      } else if (key === 'fromDate') {
        filteredParams.startDate  = params[key];
      } else if (key === 'toDate') {
        filteredParams.endDate  = params[key];
      } else if (key === 'userType') {
        filteredParams.userType  = params[key];
      }
    });
    let scheduleType = '';
    switch (result.frequency) {
      case 1 : scheduleType = 'DAILY'; break;
      case 2 : scheduleType = 'WEEKLY'; break;
      case 3 : scheduleType = 'WEEK_INTERVAL'; break;
      case 4 : scheduleType = 'MONTHLY'; break;
    }
    const dayArray = [];   if (result.frequency !== 1 && result.frequency !== 4) {
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
  //   if (this.model.toDate) {
  //     const _todate =  moment(this.model.toDate).toISOString();
  //     todate = moment(_todate).format('YYYY-MM-DD');
  //   } else {
  //     todate = '';
  //   }
  //
  //   if (this.model.fromDate) {
  //     const _fromdate =  moment(this.model.fromDate).toISOString();
  //     fromdate = moment(_fromdate).format('YYYY-MM-DD');
  //   } else {
  //     fromdate = '';
  //   }
  //   let filterParams = { payerId: '', startDate: '', endDate: '', userType: '1', timeZone: '' };
  //   filterParams.payerId = this.model.payerId === null || this.model.payerId === undefined ? '' : this.model.payerId;
  //   filterParams.userType = this.model.userType === null || this.model.userType === undefined ? '' : this.model.userType.toString();
  //   filterParams.startDate = fromdate;
  //   filterParams.endDate = todate;
  //   filterParams.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
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
    this.expandOrCollapse = true;
    this.model.selectedIndex = - 1;
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


  formatN(string) {
    return (string.toString().indexOf('.') !== -1) ? parseFloat(string).toFixed(2) : string;
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
        const minDate = new Date(this.model.fromDate);
        if (d.getTime() < minDate.getTime()) {
          this.eDateErr = true;
          this.edateMsg = 'Date should be greater or equals to start date';
        }  else {
          this.eDateErr = false;
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
