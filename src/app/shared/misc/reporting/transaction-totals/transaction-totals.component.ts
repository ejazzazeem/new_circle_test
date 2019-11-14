import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild  } from '@angular/core';
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
declare function isNumberKey(e, target): any;
declare function isValidDate(e): any;

@Component({
  selector: 'app-transaction-totals',
  templateUrl: './transaction-totals.component.html',
  styleUrls: ['./transaction-totals.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TransactionTotalsComponent implements OnInit, OnDestroy {
  @ViewChild('myTable') table: any;

  model: any = {
    groupBy: 'type',
    userId: '',
    lastName: '',
    payerName: '',
    startDate: null,
    endDate: null
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
  expandOrCollapse = true;
  // autocomplete for search
  txtQuery = '';
  txtQueryChanged: Subject<string> = new Subject<string>();
  searchResult: any = [];
  selectedGroupId = '';
  payerList: any = [];
  transactionTotals: any;
  open: false;
  appliedFilter: string;
  showHideTable = false;
  reportName = 'transaction-totals';
  private unSubscribe = new Subject();
  isMyReport = false;
  noRecordFound = false;
  paginationObj = {
    pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
  paginationSuperObj = {
    pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
  superLevelData: any;
  currentIndex = 0;
  totalObj: any;
  showTotalObj = false;
  pagerIndex = -1;
  scrollToElement: any;
  superActiveIndex: -1;
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
    // debouncing on autocomplete
    this.txtQueryChanged
        .debounceTime(10) // wait 1 sec after the last event before emitting last event
        .distinctUntilChanged() // only emit if value is different from previous value
        .takeUntil(this.unSubscribe)
        .subscribe(model => {
          this.txtQuery = model;

          // Call your function which calls API or do anything you would like do after a lag of 1 sec
          this.onSearchChange(this.txtQuery);
        });
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
      this.model.groupBy = reportFilters.groupBy;
      this.model.userId = reportFilters.userId;
      this.model.lastName = reportFilters.lastName;
      this.txtQuery = reportFilters.txtQuery;
      this.model.payerName = reportFilters.payerName;
      this.model.startDate = reportFilters.startDate;
      this.model.endDate = reportFilters.endDate;
    }
  }

  // Set Filters in Local Storage to Retain Report Information on Page Reload
  setReportFiltersInLocalStorage() {
    const reportFilters = {
      reportName: this.reportName,
      groupBy: this.model.groupBy,
      userId: this.model.userId,
      lastName: this.model.lastName,
      txtQuery: this.txtQuery,
      payerName: this.model.payerName,
      startDate: this.model.startDate,
      endDate: this.model.endDate
    };
    localStorage.setItem('reportDetail', JSON.stringify(reportFilters));
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

  displayGroupByName(columnNumber) {
    if (columnNumber === 1) {
      switch (this.appliedFilter) {
        case 'date':
          return 'Date';
        case 'hour':
          return 'Hour';
        case 'week':
          return 'Week';
        case 'month': case 'monthpayer':
          return 'Month';
        case 'year':
          return 'Year';
        case 'facility':
          return 'Practice / Facility';
        case 'provider':
          return 'Provider';
        case 'payer':
          return 'Payer';
        case 'userprovider':
          return 'User';
      }
    } else {
      switch (this.appliedFilter) {
        case 'monthpayer':
          return 'Payer';
        case 'userprovider':
          return 'Provider';
      }
    }
  }

  displayAppliedFilterColumnValue(value) {
    switch (this.appliedFilter) {
      case 'date':
          return value.date ? moment(value.date).format('MM/DD/YYYY') : '';
      case 'year':
           return parseInt(value.year, 0);
      case 'month':
        return this.parseMonths(value.month) + ' ' + parseInt(value.year, 0).toString();
      case 'week':
        return moment(value.weekStartDate).format('MM/DD/YYYY') + ' - ' + moment(value.weekEndDate).format('MM/DD/YYYY');
      case 'hour':
        return moment(value.date).format('MM/DD/YYYY') + ' ' + this.parseHour(value.hour);
      case 'payer':
        return value.payer;
      case 'facility':
        return value.facility;
        case 'provider':
          return (value.provider === 'missing Provider') ? 'No provider selected' : value.provider ;
        case 'monthpayer':
          return this.parseMonths(value.month) + ' ' + parseInt(value.year, 0).toString();
      case 'userprovider':
        return value.user;
    }
  }
  displayAppliedFilterColumnValue2(value) {
    switch (this.appliedFilter) {
      case 'monthpayer':
         return value.payer;
      case 'userprovider':
         return (value.provider === 'missing Provider') ? 'No provider selected' : value.provider ;
    }
  }

  parseMonths(month) {

    switch (month) {
      case '1.0': case 1:
        return 'January';
      case '2.0': case 2:
        return 'February';
      case '3.0': case 3:
        return 'March';
      case '4.0': case 4:
        return 'April';
      case '5.0': case 5:
        return 'May';
      case '6.0': case 6:
        return 'June';
      case '7.0': case 7:
        return 'July';
      case '8.0': case 8:
        return 'August';
      case '9.0': case 9:
        return 'September';
      case '10.0': case 10:
        return 'October';
      case '11.0': case 11:
        return 'November';
      case '12.0': case 12:
        return 'December';
      default: break;
    }
  }
  parseHour(value) {
   if (value < 12) {
     return value + 'AM';
   } else return (value - 12 === 0) ? '12 PM' : value-12 + 'PM';
  }

  onFieldChange(query: string) {
    this.txtQueryChanged.next(query);
  }

  onSearchChange(searchValue: string) {
    if (searchValue !== '') {
      this.sortParams.keyword = searchValue;
      this.reportingService.getAllGroups(this.sortParams.keyword).takeUntil(this.unSubscribe).subscribe(response => {
        this.searchResult = response;
      });
    } else {
      this.sortParams.keyword = '';
      this.searchResult = null;
      this.txtQuery = '';
    }
  }

  setMultiSelectedIndex(index, details) {
    this.model.selectedMonth = details;
    let param ;
    if (this.appliedFilter === 'monthpayer') {
      param = details.breakDownDetails.payer;
    }


  }

  updateName(event) {
    const value = event.option.value;
    const filteredArray = this.searchResult.filter(x => x.name === value);
    if (filteredArray.length > 0) {
      this.selectedGroupId = filteredArray[0].providerGroupId;
    }
  }

  getTotalSuccess(obj) {
    let total = 0;
    if (this.appliedFilter === 'monthpayer' || this.appliedFilter === 'userprovider') {
      if (obj.transactionDetailsByPayer) {
        obj.transactionDetailsByPayer.forEach((innerObj) => {
          total = total + innerObj.success;
        });
      }
    }

    if (this.appliedFilter !== 'monthpayer' && this.appliedFilter !== 'userprovider'
        && this.appliedFilter !== 'type' ) {
      if (obj.details) {
        obj.details.forEach(eachObj => {
          total = total + eachObj.success;
        });
      }
    }

    return total;
  }

  getTotalFailure(obj) {
    let total = 0;
    if (this.appliedFilter === 'monthpayer' || this.appliedFilter === 'userprovider') {
      if (obj.transactionDetailsByPayer) {
        obj.transactionDetailsByPayer.forEach((innerObj) => {
          total = total + innerObj.failure;
        });
      }
    }
    if (this.appliedFilter !== 'monthpayer' && this.appliedFilter !== 'userprovider'
        && this.appliedFilter !== 'type' ) {
      if (obj.details) {
        obj.details.forEach(eachObj => {
          total = total + eachObj.failure;
        });
      }
    }
    return total;
  }

  getTotal(obj) {
    let total = 0;
    if (this.appliedFilter === 'monthpayer' || this.appliedFilter === 'userprovider') {
      if (obj.transactionDetailsByPayer) {
        obj.transactionDetailsByPayer.forEach((innerObj) => {
          total = total + innerObj.total;
        });
      }
    }

    if (this.appliedFilter !== 'monthpayer' && this.appliedFilter !== 'userprovider'
        && this.appliedFilter !== 'type' ) {
      if (obj.details) {
        obj.details.forEach(eachObj => {
          total = total + eachObj.total;
        });
      }
    }
    return total;
  }

  getTotalPercentageSuccess(obj) {
    let total = 0;

    if (this.appliedFilter === 'monthpayer' || this.appliedFilter === 'userprovider') {
      if (obj.transactionDetailsByPayer) {
        obj.transactionDetailsByPayer.forEach((innerObj) => {
          total = total + innerObj.successPercentage;
        });
        return (total / obj.transactionDetailsByPayer.length);
      }
    }
    if (this.appliedFilter !== 'monthpayer' && this.appliedFilter !== 'userprovider'
        && this.appliedFilter !== 'type' ) {
      if (obj.details) {
        obj.details.forEach(eachObj => {
          total = total + eachObj.successPercentage;
        });

      return (total / obj.details.length);
      }
    }

    return '';
  }

  getTotalAvgSeconds(obj) {
    let total = 0;
    if (this.appliedFilter === 'monthpayer' || this.appliedFilter === 'userprovider') {
      if (obj.transactionDetailsByPayer) {
        obj.transactionDetailsByPayer.forEach((innerObj) => {
          total = total + innerObj.avgSeconds;
        });
        return total / obj.transactionDetailsByPayer.length;
      }
    }
    if (this.appliedFilter !== 'monthpayer' && this.appliedFilter !== 'userprovider'
        && this.appliedFilter !== 'type' ) {
      if (obj.details) {
        obj.details.forEach(eachObj => {
          total = total + eachObj.avgSeconds;
        });
        return total  / obj.details.length;
      }
    }
    return '';
  }

  applyFilter() {
    this.loaderService.display(true);
    this.showHideTable = true;
    this.showTotalObj = false;
    this.transactionTotals = [];
   this.resetChild();

    // Set Filters in Local Storage to Retain Report Information on Page Reload
    this.setReportFiltersInLocalStorage();
    this.appliedFilter = this.model.groupBy;
    let  _filterTo, _filterfrom = null;
    if (this.model.startDate) {
      const _fdate = moment(this.model.startDate).toISOString();
      _filterTo = moment(_fdate).format('YYYY-MM-DD');
    }
    if (this.model.endDate) {
      const _tdate = moment(this.model.endDate).toISOString();
      _filterfrom = moment(_tdate).format('YYYY-MM-DD');
    }
    this.populateTotals(this.model.userId, this.model.lastName,
        this.model.payerName, _filterTo, _filterfrom, this.txtQuery);
    if (this.appliedFilter === 'type') {
        this.reportingService.getPaginatedTransactionTotals(this.model.groupBy, this.model.userId, this.model.lastName,
           this.model.payerName, _filterTo, _filterfrom, this.txtQuery, null , null , null,
            this.paginationObj.pageSize, this.paginationObj.currentOffSet)
            .takeUntil(this.unSubscribe).subscribe(
            data => {
                this.transactionTotals = data.results[0];
                this.paginationObj.totalRecords = data.totalCount;
                this.noRecordFound = this.paginationObj.totalRecords === 0 ? true : false;
                this.loaderService.display(false);
            },
            error => {
              this.noRecordFound = true;
              this.loaderService.display(false);
              this.alertService.error(error.error.errors[0].endUserMessage);
            });

    } else if (this.appliedFilter === 'date' || this.appliedFilter === 'year' || this.appliedFilter === 'month'
    || this.appliedFilter === 'week'  || this.appliedFilter === 'hour' || this.appliedFilter === 'payer'
     || this.appliedFilter === 'facility' || this.appliedFilter === 'provider' ) {

      this.reportingService.getPaginatedTransactionTotals(this.model.groupBy, this.model.userId, this.model.lastName,
          this.model.payerName, _filterTo, _filterfrom, this.txtQuery, null , null , null,
          this.paginationObj.pageSize, this.paginationObj.currentOffSet)
          .takeUntil(this.unSubscribe).subscribe(
          data => {
            this.transactionTotals = data.results;
            this.paginationObj.totalRecords = data.totalCount;
            this.noRecordFound = this.paginationObj.totalRecords === 0 ? true : false;
            this.loaderService.display(false);
          },
          error => {
            this.noRecordFound = true;
            this.loaderService.display(false);
            this.alertService.error(error.error.errors[0].endUserMessage);
          });


    }  else if (this.appliedFilter === 'monthpayer') {
      this.reportingService.getPaginatedTransactionTotalsByMonth(this.model.userId, this.model.lastName,
          this.model.payerName, _filterTo, _filterfrom, this.txtQuery,
          200, 0)
          .takeUntil(this.unSubscribe).subscribe(
          data => {
            this.superLevelData = data.results;
            this.loaderService.display(false);
          },
          error => {
            this.noRecordFound = true;
            this.loaderService.display(false);
            this.alertService.error(error.error.errors[0].endUserMessage);
          });
    } else if (this.appliedFilter === 'userprovider') {
      this.reportingService.getPaginatedTransactionTotalsByUsers(this.model.userId, this.model.lastName,
          this.model.payerName, _filterTo, _filterfrom, this.txtQuery,
          this.paginationSuperObj.pageSize, this.paginationSuperObj.currentOffSet)
          .takeUntil(this.unSubscribe).subscribe(
          data => {
            this.superLevelData = data.results;
            this.paginationSuperObj.totalRecords = data.totalCount;
            this.noRecordFound = data.totalCount > 0 ? false : true;
            this.loaderService.display(false);
          },
          error => {
            this.noRecordFound = true;
            this.loaderService.display(false);
            this.alertService.error(error.error.errors[0].endUserMessage);
          });
    }


  }

  setSelectedIndex(index) {
    this.model.selectedIndex = index;
  }

  clearFilter() {
    this.transactionTotals = [];
    this.txtQuery = '';
    this.model.groupBy = 'type';
    this.model.userId = '';
    this.model.lastName = '';
    this.model.payerName = '';
    this.model.startDate = null;
    this.model.endDate = null;
    this.showHideTable = false;
    this.edateMsg = '';
    this.sdateMsg = '';
    this.eDateErr = false;
    this.sDateErr = false;
    this.paginationObj = {
      pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
    this.paginationSuperObj = {
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
      userLastName : '',
      groupName : '',
      payerName : '',
      startDate : '',
      endDate : '',
    };
    Object.keys(params).forEach(function(key) {
      if (key === 'groupBy') {
        filteredParams.breakDown = params[key];
      } else if (key === 'userId') {
        filteredParams.userId  = params[key];
      } else if (key === 'lastName') {
        filteredParams.userLastName  = params[key];
      } else if (key === 'txtQuery') {
        filteredParams.groupName  = params[key];
      } else if (key === 'payerName') {
        filteredParams.payerName  = params[key];
      } else if (key === 'startDate') {
        filteredParams.startDate  = params[key] === null ? '' : params[key];
      } else if (key === 'endDate') {
        filteredParams.endDate  = params[key] === null ? '' : params[key];
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
    } else if (result.emails.length === 1 )   {
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
  //   if (this.model.endDate) {
  //     const _todate =  moment(this.model.endDate).toISOString();
  //     todate = moment(_todate).format('YYYY-MM-DD');
  //   } else {
  //     todate = '';
  //   }
  //
  //   if (this.model.startDate) {
  //     const _fromdate =  moment(this.model.startDate).toISOString();
  //     fromdate = moment(_fromdate).format('YYYY-MM-DD');
  //   } else {
  //     fromdate = '';
  //   }
  //   let filterParams = {breakDown: '', userId: '', userLastName: '', payerName: '', startDate: '', endDate: '',   groupName: '' };
  //   filterParams.breakDown = this.model.groupBy === null || this.model.groupBy === undefined ? '' : this.model.groupBy;
  //   filterParams.userId = this.model.userId === null || this.model.userId === undefined ? '' : this.model.userId;
  //   filterParams.userLastName =  this.model.lastName === null || this.model.lastName === undefined ? '' : this.model.lastName;
  //   filterParams.payerName =  this.model.payerName === null || this.model.payerName === undefined ? '' : this.model.payerName;
  //   filterParams.startDate = fromdate;
  //   filterParams.endDate = todate;
  //   filterParams.groupName = this.txtQuery ;
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
    let csv, bodyData;
    if (this.appliedFilter === 'monthpayer' || this.appliedFilter === 'userprovider') {
      bodyData = document.getElementsByClassName('fullReport')[0];
      csv = this.reportingService.create3rdLevelCsv(headerData, bodyData );
    } else {
      bodyData = document.getElementsByClassName('collapsible-body')[0];
      csv = this.reportingService.createCsv(headerData, bodyData );
    }
    const fileName = this.reportName + new Date().toISOString() + '.csv';
    this.reportingService.downloadReport(csv, fileName);

  }

  displayType(data) {
  let isSame = true;
  let type = data[0].transactionType;
  for (let i = 1; i < data.length; i++) {
    if (type !== data[i].transactionType) {
      isSame = false;
      break;
    } else {
      type = data[i].transactionType;
    }
  }
  return isSame ? data[0].transactionType : '';

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

  getInnerData(details, index) {
    this.loaderService.display(true);
  this.currentIndex = index;
  this.superActiveIndex = index;
    this.appliedFilter = this.model.groupBy;
    let  _filterTo, _filterfrom = null;
    if (this.model.startDate) {
      const _fdate = moment(this.model.startDate).toISOString();
      _filterTo = moment(_fdate).format('YYYY-MM-DD');
    }
    if (this.model.endDate) {
      const _tdate = moment(this.model.endDate).toISOString();
      _filterfrom = moment(_tdate).format('YYYY-MM-DD');
    }
    let internalParam1, internalparam2, internalParam3;
    if (this.appliedFilter === 'monthpayer') {
      internalParam1 = details.breakDownDetails.month;
      internalparam2 =  details.breakDownDetails.year;
      internalParam3 = null;
    } else if (this.appliedFilter === 'userprovider') {
      internalParam1 = null;
      internalparam2 =  null;
      internalParam3 = details.breakDownDetails.user ? details.breakDownDetails.user : '';
    }
    this.reportingService.getPaginatedTransactionTotals(this.model.groupBy, this.model.userId, this.model.lastName,
        this.model.payerName, _filterTo, _filterfrom, this.txtQuery, internalParam1 , internalparam2 , internalParam3,
        this.paginationObj.pageSize, this.paginationObj.currentOffSet)
        .takeUntil(this.unSubscribe).subscribe(
        data => {

          this.transactionTotals = data.results;
          this.pagerIndex = data.returnCount - 1;
          this.paginationObj.totalRecords = data.totalCount;
          this.loaderService.display(false);
        },
        error => {
          this.transactionTotals = null;
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        });
  }

  updateInnerPageSize(size, details) {
    this.paginationObj.pageSize = size;
    this.paginationObj.totalRecords = 0;
    this.paginationObj.currentOffSet = 0;
    this.getInnerData(details, this.currentIndex);
    this.scrollToElement = document.getElementById('reportDiv');
    this.scrollFunction(this.scrollToElement);
  }

  updateInnerPage(event, details) {
    this.paginationObj.currentOffSet = event;
    this.getInnerData(details, this.currentIndex);
    this.scrollToElement = document.getElementById('reportDiv');
    this.scrollFunction(this.scrollToElement);
  }

  updateSuperPageSize(size) {
    this.paginationSuperObj.pageSize = size;
    this.paginationSuperObj.currentOffSet = 0;
    this.applyFilter();
    this.scrollToElement = document.getElementById('reportDiv');
    this.scrollFunction(this.scrollToElement);
  }

  updateSuperPage(event) {
    this.paginationSuperObj.currentOffSet = event;
    this.applyFilter();
    this.scrollToElement = document.getElementById('reportDiv');
    this.scrollFunction(this.scrollToElement);
  }

  populateTotals(userid, userlastname, payername, startdate,
                 enddate,  groupname) {
    this.reportingService.getGrandTransactionTotals(userid, userlastname, payername, startdate,
        enddate,  groupname)
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          this.showTotalObj = true;
          this.totalObj = data;
        },
        error => {
          this.showTotalObj = false;
          this.alertService.error(error.error.errors[0].endUserMessage);
        });
  }
  scrollFunction(element) {
    this.scrollToElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
  }
  formatN(string) {
    return (string.toString().indexOf('.') !== -1) ? parseFloat(string).toFixed(2) : string;
  }

  updateIndices() {
    this.showTotalObj = false;
    this.superActiveIndex = -1;
    this.pagerIndex = 0;
    this.paginationObj = {
      pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
    this.paginationSuperObj = {
      pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
  }

  resetChild() {
    if (this.appliedFilter !== 'type' && this.appliedFilter !== 'monthpayer' && this.appliedFilter !== 'userprovider' ) {
      this.model.selectedIndex = -1;
    } else if (this.appliedFilter === 'monthpayer') {
      this.superActiveIndex = -1;
      this.transactionTotals = [];
    } else if (this.appliedFilter === 'userprovider') {
      this.superActiveIndex = -1;
      this.transactionTotals = [];
      this.paginationObj = {
        pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
      this.pagerIndex = -1;
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
        const minDate = new Date(this.model.startDate);
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
