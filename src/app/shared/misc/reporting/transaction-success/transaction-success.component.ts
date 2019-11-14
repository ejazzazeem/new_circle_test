import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { AlertService, LoaderService, ReportingService, ViewAllPayersService, GroupListService } from '@services/index';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { SaveReportDialogComponent } from '../save-report-dialog';
import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-transaction-success',
  templateUrl: './transaction-success.component.html',
  styleUrls: ['./transaction-success.component.scss']
})
export class TransactionSuccessComponent implements OnInit, OnDestroy {

  model: any =  {timePeriod: '', transactionType: '', payerName: '',  selectedIndex: -1};
  payerList: any = [];
  private unSubscribe = new Subject();
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
  isMyReport = false;
  reportName = 'recent-transaction-success';
  showHideTable = false;
  results: any;
  expandOrCollapse = true;
  noRecordFound = false;
  totalObj: any;
  paginationObj = {
    pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
  details: any;
  innerResponse: any;
  scrollToElement: any;
  constructor(private alertService: AlertService,
              private loaderService: LoaderService,
              private reportingService: ReportingService,
              private payersService: ViewAllPayersService,
              private router: Router,
              public dialog: MatDialog) { }

  ngOnInit() {
    this.getAllPayers();
    this.getReportFiltersFromLocalStorage();
    if (localStorage.getItem('currentTab') !== null && localStorage.getItem('currentTab') !== undefined) {
      this.isMyReport = true;
      this.applyFilter();
    }
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

  // Set/Get Report Filter to Retain Info on Page Reload - Start ----------------------------------------------
  getReportFiltersFromLocalStorage() {
    // Get Report Data from local storage if available, else set default data for this report
    const reportFilters = JSON.parse(localStorage.getItem('reportDetail'));
    if (!reportFilters || reportFilters.reportName !== this.reportName) {
      // Set Filters in Local Storage to Retain Report Information on Page Reload
      this.setReportFiltersInLocalStorage();
    } else {
      this.model.timePeriod = reportFilters.timePeriod;
      this.model.transactionType = reportFilters.transactionType;
      this.model.payerName = reportFilters.payerName;
    }
  }

  // Set Filters in Local Storage to Retain Report Information on Page Reload
  setReportFiltersInLocalStorage() {
    const reportFilters = {
      reportName: this.reportName,
      timePeriod: this.model.timePeriod,
      transactionType: this.model.transactionType,
      payerName: this.model.payerName
    };
    localStorage.setItem('reportDetail', JSON.stringify(reportFilters));
  }
// Set/Get Report Filter to Retain Info on Page Reload - End ----------------------------------------------

  clearFilter() {
   this.model.timePeriod = '';
   this.model.transactionType = '';
   this.model.payerName = '';
   this.model.selectedIndex = -1;
   this.showHideTable = false;
   this.results = null;
    this.paginationObj = {
      pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
  }

  applyFilter() {
    if (this.model.timePeriod === null || this.model.timePeriod === undefined || this.model.timePeriod === '') {
      this.alertService.error('Please select time period');
      return false;
    }
    this.loaderService.display(true);
    this.showHideTable = true;
    this.results = [];
    this.resetChild();

    // Set Filters in Local Storage to Retain Report Information on Page Reload
    this.setReportFiltersInLocalStorage();

   this.getGrandTotals(this.model.timePeriod, this.model.payerName,  this.model.transactionType);
    this.reportingService.getPaginatedRecentTransactions(this.model.timePeriod, this.model.payerName, this.model.transactionType,
    this.paginationObj.currentOffSet, this.paginationObj.pageSize)
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          this.results = data.results;
          this.paginationObj.totalRecords = data.totalCount;
          if ( data.totalCount === 0) {
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

  setSelectedIndex(index, row) {
    this.model.selectedIndex = index;
    this.details = row;
    this.getDetails(row);

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
      payerName : '',
      timePeriod : '',
      breakDown : ''
    };
    Object.keys(params).forEach(function(key) {
      if (key === 'payerName') {
        filteredParams.payerName = params[key];
      } else if (key === 'timePeriod') {
        filteredParams.timePeriod  = params[key];
      } else if (key === 'transactionType') {
        filteredParams.breakDown = params[key];
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
      }
    }

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
    } else if (result.emails.length === 1) {
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
  //   let filterParams = { timePeriod: '', payerName: '', transactionType: '' };
  //   filterParams.timePeriod = this.model.timePeriod === null || this.model.timePeriod === undefined ? '' : this.model.timePeriod;
  //   filterParams.payerName = this.model.payerName === null || this.model.payerName === undefined ? '' : this.model.payerName;
  //   filterParams.transactionType = this.model.transactionType === null || this.model.transactionType === undefined ? '' : this.model.transactionType;
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

  getGrandTotals(timeperiod, payername, transactiontype) {
    this.loaderService.display(true);
    this.reportingService.getRecentTransactionGrande(timeperiod, payername, transactiontype)
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          this.totalObj = data;
          this.loaderService.display(false);
        },
        error => {
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        });
  }


  getDetails(details) {
    this.loaderService.display(true);
    this.reportingService.getRecentTransactionsByPayer(this.model.timePeriod, details.payerName,  this.model.transactionType)
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          this.innerResponse = data;
          this.loaderService.display(false);
        },
        error => {
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        });
  }

  updatePageSize(size) {
    this.paginationObj.pageSize = size;
    this.paginationObj.currentOffSet = 0;
    this.model.selectedIndex = -1;
    this.applyFilter();
    this.scrollToElement = document.getElementById('reportDiv');
    this.scrollFunction(this.scrollToElement);
  }

  updatePage(event) {
    this.paginationObj.currentOffSet = event;
    this.model.selectedIndex = -1;
    this.applyFilter();
    this.scrollToElement = document.getElementById('reportDiv');
    this.scrollFunction(this.scrollToElement);
  }

  scrollFunction(element) {
    this.scrollToElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
  }

  formatN(string) {
    return (string.toString().indexOf('.') !== -1) ? parseFloat(string).toFixed(2) : string;
  }
  resetChild() {
    // this.details = null;
   this.innerResponse = null;
   this.model.selectedIndex = -1;

  }
}
