import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AlertService, LoaderService, ReportingService, ViewAllPayersService, GroupListService } from '@services/index';
import {Subject} from 'rxjs/Subject';
import * as moment from 'moment';
declare function isNumberKey(e, target): any;
declare function isValidDate(e): any;
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { SaveReportDialogComponent } from '../save-report-dialog';
import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-net-exchange-usage',
  templateUrl: './net-exchange-usage.component.html',
  styleUrls: ['./net-exchange-usage.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NetExchangeUsageComponent implements OnInit, OnDestroy {

  model = {
    groupType: 'user',
    userId: '',
    payer: '',
    dateFrom: '',
    dateTo: '',
    selectedIndex: -1,
    selectedMonth: ''
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
  appliedFilter: string;
  results: any;
  childResponse: any;
  payerList: any;
  private unSubscribe = new Subject();
  reportName = 'net-exchange-usage';
  showHideTable = false;
  isMyReport = false;
  noRecordFound = false;
  totalsObj: any = {};
  paginationObj = {
    pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
  childPaginationObj = {
    pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
  details: any;
  showInnerPager = false;
  monthwise: any;
  showFirstPager = false; scrollToElement: any;
  superActiveIndex = -1;
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

  // Set/Get Report Filter to Retain Info on Page Reload - Start ----------------------------------------------
  getReportFiltersFromLocalStorage() {
    // Get Report Data from local storage if available, else set default data for this report
    const reportFilters = JSON.parse(localStorage.getItem('reportDetail'));
    if (!reportFilters || reportFilters.reportName !== this.reportName) {
      // Set Filters in Local Storage to Retain Report Information on Page Reload
      this.setReportFiltersInLocalStorage();
    } else {
      this.model.groupType = reportFilters.groupType;
      this.model.userId = reportFilters.userId;
      this.model.payer = reportFilters.payer;
      this.model.dateFrom = reportFilters.dateFrom;
      this.model.dateTo = reportFilters.dateTo;
    }
  }

  // Set Filters in Local Storage to Retain Report Information on Page Reload
  setReportFiltersInLocalStorage() {
    const reportDetail = {
      reportName: this.reportName,
      groupType: this.model.groupType,
      userId: this.model.userId,
      payer: this.model.payer,
      dateFrom: this.model.dateFrom,
      dateTo: this.model.dateTo
    };
    localStorage.setItem('reportDetail', JSON.stringify(reportDetail));
  }
// Set/Get Report Filter to Retain Info on Page Reload - End ----------------------------------------------

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



  clearFilter() {
    this.appliedFilter = null;
    this.results = [];
    this.model.payer = '';
    this.model.userId = '';
    this.model.groupType = 'user';
    this.model.dateFrom = '';
    this.model.dateTo = '';
    this.model.selectedIndex = -1;
    this.model.selectedMonth = '';
    this.showHideTable = false;
    this.sdateMsg = '';
    this.edateMsg = '';
    this.sDateErr = false;
    this.eDateErr = false;
    this.paginationObj = {
      pageSize : 1, currentOffSet : 0,  totalRecords: 0 };
    this.childPaginationObj = {
      pageSize : 1, currentOffSet : 0,  totalRecords: 0 };
    // Set Filters in Local Storage to Retain Report Information on Page Reload
    this.setReportFiltersInLocalStorage();

  }
  setSelectedIndex(index, result) {
      this.model.selectedIndex = index;
      this.details = result;
      this.getLastLevelRecords(result, null, null);

  }

  getMonthWiseDetails(month,index) {
    this.superActiveIndex = index;
    this.appliedFilter = this.model.groupType;
    let fromDate;
    let toDate;
    if (this.model.dateFrom) {
      const _fDate = moment(this.model.dateFrom).toISOString();
      fromDate = moment(_fDate).format('YYYY-MM-DD');
    }
    if (this.model.dateTo) {
      const _tDate = moment(this.model.dateTo).toISOString();
      toDate = moment(_tDate).format('YYYY-MM-DD');
    }
    this.getNEUsageByUser(this.appliedFilter, this.model.userId, this.model.payer, fromDate, toDate,month.split(' ')[1],month.split(' ')[0],
    this.paginationObj.currentOffSet, this.paginationObj.pageSize);

  }

  setMultiSelectedIndex(index, details, month) {
    this.model.selectedMonth = month.split(' ')[0];
    this.model.selectedIndex = index;
    this.details = details;
    this.getLastLevelRecords(details, month.split(' ')[0] , month.split(' ')[1]);

  }



  applyFilter() {
    this.loaderService.display(true);
    this.results = [];
    this.resetChild();
    this.showHideTable = true;
    // Set Filters in Local Storage to Retain Report Information on Page Reload
    this.setReportFiltersInLocalStorage();

    this.appliedFilter = this.model.groupType;
    let fromDate;
    let toDate;
    if (this.model.dateFrom) {
      const _fDate = moment(this.model.dateFrom).toISOString();
     fromDate = moment(_fDate).format('YYYY-MM-DD');
    }
    if (this.model.dateTo) {
      const _tDate = moment(this.model.dateTo).toISOString();
      toDate = moment(_tDate).format('YYYY-MM-DD');
    }
    this.getGrandTotals(this.model.userId, this.model.payer, fromDate, toDate);
    if (this.model.groupType === 'user') {
      this.getNEUsageByUser(this.appliedFilter, this.model.userId, this.model.payer, fromDate, toDate,
          null,null,this.paginationObj.currentOffSet, this.paginationObj.pageSize);
    } else {
      this.getNEUsageByMonth(this.model.userId, this.model.payer, fromDate, toDate);
    }



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
      breakDown : '',
      userId : '',
      payerName : '',
      startDate : '',
      endDate : ''
    };
    Object.keys(params).forEach(function(key) {
      if (key === 'groupType') {
        filteredParams.breakDown = params[key];
      } else if (key === 'userId') {
        filteredParams.userId  = params[key];
      } else if (key === 'payer') {
        filteredParams.payerName  = params[key];
      } else if (key === 'dateFrom') {
        filteredParams.startDate  = params[key];
      } else if (key === 'dateTo') {
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
  //   if (this.model.dateTo) {
  //     const _todate =  moment(this.model.dateTo).toISOString();
  //     todate = moment(_todate).format('YYYY-MM-DD');
  //   } else {
  //     todate = '';
  //   }
  //
  //   if (this.model.dateFrom) {
  //     const _fromdate =  moment(this.model.dateFrom).toISOString();
  //     fromdate = moment(_fromdate).format('YYYY-MM-DD');
  //   } else {
  //     fromdate = '';
  //   }
  //   let filterParams = { breakDown: '', userId: '',   payerName: '',   startDate: '',   endDate: '' };
  //   filterParams.breakDown = this.model.groupType;
  //   filterParams.userId = this.model.userId === null || this.model.userId === undefined ? '' : this.model.userId;
  //   filterParams.payerName = this.model.payer === null || this.model.payer === undefined ? '' : this.model.payer;
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

    this.model.selectedIndex = - 1;
    const printContents = document.getElementById('reportDiv').innerHTML;
    setTimeout(this.reportingService.printReport(printContents) , 2000);
  }

  downloadCSV() {
    const headerData = document.getElementsByClassName('collapsible-head')[0];
    let bodyData, csv;
    if (this.appliedFilter === 'user') {
      bodyData = document.getElementsByClassName('collapsible-body')[0];
      csv =  this.reportingService.createCsv(headerData, bodyData );
    } else {
      bodyData = document.getElementsByClassName('fullReport')[0];
      csv = this.reportingService.create3rdLevelCsv(headerData, bodyData );
    }
    const fileName = this.reportName + new Date().toISOString() + '.csv';
    this.reportingService.downloadReport(csv, fileName);

  }
  getNEUsageByMonth(userid, payername, startdate, enddate) {
    this.reportingService.getNEreportByMonths( userid, payername, startdate, enddate,
        0, 200)
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          const arr = Object.values(data.results);
          if (arr.length === 0) {
            this.noRecordFound = true;
            this.monthwise = [];
          } else {
            this.noRecordFound = false;
            this.monthwise = data.results;
          }
          this.loaderService.display(false);
        },
        error => {
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        });
  }

  getNEUsageByUser(breakdown, userid, payername, startdate, enddate, year, month,currentOffset, currentSize) {
    this.loaderService.display(true);
    this.reportingService.getNEreportByUser(breakdown, userid, payername, startdate, enddate, year, month,
    currentOffset, currentSize)
        .takeUntil(this.unSubscribe).subscribe(
        data => {

          const arr = Object.values(data);
          if (data.totalCount === 0) {
            this.noRecordFound = true;
          } else {
            this.noRecordFound = false;
            this.results = data.results;
            this.paginationObj.totalRecords = data.totalCount;
            if (this.paginationObj.totalRecords >= currentSize) {
              this.showFirstPager = true;
            }

          }
          this.loaderService.display(false);
        },
        error => {
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        });
  }

  getLastLevelRecords(data, month, year) {
    this.loaderService.display(true);
    let fromDate;
    let toDate;
    if (this.model.dateFrom) {
      const _fDate = moment(this.model.dateFrom).toISOString();
      fromDate = moment(_fDate).format('YYYY-MM-DD');
    }
    if (this.model.dateTo) {
      const _tDate = moment(this.model.dateTo).toISOString();
      toDate = moment(_tDate).format('YYYY-MM-DD');
    }
    this.reportingService.getNEreportByPayer(this.appliedFilter, data.userId, this.model.payer, fromDate, toDate, year, month ,
        this.childPaginationObj.currentOffSet, this.childPaginationObj.pageSize)
        .takeUntil(this.unSubscribe).subscribe(
        res => {
            this.childResponse = res.results;
            this.childPaginationObj.totalRecords = res.totalCount;
          if (this.childPaginationObj.totalRecords >= this.childPaginationObj.pageSize) {
            this.showInnerPager = true;
          }
          this.loaderService.display(false);
        },
        error => {
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        });

  }

  getGrandTotals(userid , payername, startdate, enddate) {
    this.loaderService.display(true);
    this.reportingService.getNEgrandTotals(userid, payername, startdate, enddate)
        .takeUntil(this.unSubscribe).subscribe(
        data => {
        this.totalsObj = data;
        },
        error => {
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        });
  }

  updatePageSize(size) {
    this.paginationObj.pageSize = size;
    this.paginationObj.currentOffSet = 0;
    this.applyFilter();
    this.scrollToElement = document.getElementById('reportDiv');
    this.scrollFunction(this.scrollToElement);
  }

  updatePage(event) {
    this.paginationObj.currentOffSet = event;
    this.applyFilter();
    this.scrollToElement = document.getElementById('reportDiv');
    this.scrollFunction(this.scrollToElement);
  }

  updateChildPageSize(size, monthyear) {
    this.childPaginationObj.pageSize = size;
    this.childPaginationObj.currentOffSet = 0;
    let month, year = null;
    if (monthyear !== null) {
      month = monthyear.split(' ')[0];
      year = monthyear.split(' ')[1];
    }

    this.getLastLevelRecords(this.details, month, year);
    this.scrollToElement = document.getElementById('reportDiv');
    this.scrollFunction(this.scrollToElement);
  }

  updateChildPage(event, monthyear) {
    this.childPaginationObj.currentOffSet = event;
    let month, year = null;
    if (monthyear !== null) {
      month = monthyear.split(' ')[0];
      year = monthyear.split(' ')[1];
    }
    this.getLastLevelRecords(this.details, month, year);
    this.scrollToElement = document.getElementById('reportDiv');
    this.scrollFunction(this.scrollToElement);
  }

  updatePage2(event, monthyear) {
    const MonthWise = this.monthwise;
    this.paginationObj.currentOffSet = event;
    this.appliedFilter = this.model.groupType;
    let fromDate;
    let toDate;
    if (this.model.dateFrom) {
      const _fDate = moment(this.model.dateFrom).toISOString();
      fromDate = moment(_fDate).format('YYYY-MM-DD');
    }
    if (this.model.dateTo) {
      const _tDate = moment(this.model.dateTo).toISOString();
      toDate = moment(_tDate).format('YYYY-MM-DD');
    }
    let month, year = null;
    if (monthyear !== null) {
      month = monthyear.split(' ')[0];
      year = monthyear.split(' ')[1];
    }
    this.getNEUsageByUser(this.appliedFilter, this.model.userId, this.model.payer, fromDate, toDate,month,year, this.paginationObj.currentOffSet, this.paginationObj.pageSize);
  }

  updatePageSize2(size, monthyear) {
    this.paginationObj.pageSize = size;
    this.paginationObj.currentOffSet = 0;
    this.appliedFilter = this.model.groupType;
    let fromDate;
    let toDate;
    if (this.model.dateFrom) {
      const _fDate = moment(this.model.dateFrom).toISOString();
      fromDate = moment(_fDate).format('YYYY-MM-DD');
    }
    if (this.model.dateTo) {
      const _tDate = moment(this.model.dateTo).toISOString();
      toDate = moment(_tDate).format('YYYY-MM-DD');
    }
    let month, year = null;
    if (monthyear !== null) {
      month = monthyear.split(' ')[0];
      year = monthyear.split(' ')[1];
    }
    this.getNEUsageByUser(this.appliedFilter, this.model.userId, this.model.payer, fromDate, toDate,month, year, this.paginationObj.currentOffSet, this.paginationObj.pageSize);
  }


  scrollFunction(element) {
    this.scrollToElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
  }

  resetChild() {
    if (this.appliedFilter === 'user') {
      this.childPaginationObj = {
        pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
      this.childResponse = null;
      this.model.selectedIndex = -1;
      this.showInnerPager = false;
    } else {
      this.superActiveIndex = -1;
      this.results = [];
      this.showFirstPager = false;
        this.childResponse = null;
      this.paginationObj = {
        pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
    }

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
        const minDate = new Date(this.model.dateFrom);
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
