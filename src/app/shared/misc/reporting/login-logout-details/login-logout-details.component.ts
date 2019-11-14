import {Component, OnInit, ViewEncapsulation, OnDestroy} from '@angular/core';
import { AlertService, LoaderService, ReportingService } from '@services/index';
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
  selector: 'app-login-logout-details',
  templateUrl: './login-logout-details.component.html',
  styleUrls: ['./login-logout-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginLogoutDetailsComponent implements OnInit, OnDestroy {
  showDetails = false;
  response: any;
  innerResponse: any;
  model: any = {
    userId: '',
    lastName: '',
    fromDate: '',
    toDate: '',
    role : 'ALL'
  };
  displayBackToTopBtn = false;
  reportName = 'login-logout-details';
  private unSubscribe = new Subject();
  isMyReport = false;

  noRecordFound = false;
  paginationObj = {
    pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
  paginationChildObj = {
    pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
  userRoles = [
    {role: 'PRACTICE_OFFICE_USER', viewValue: 'Practice Office User'},
    {role: 'PAYER_USER', viewValue: 'Payer User'},
    {role: 'NETEXCHANGE_ACCOUNT', viewValue: 'NetExchange Account'},
    {role: 'ADMINISTRATORS', viewValue: 'Administrators'},
    {role: 'ALL', viewValue: 'All'}
  ];
  details: any;
  showInnerPager = false;
  scrollToElement: any;
  sDateErr = false;
  eDateErr = false;
  sdateMsg = '';
  edateMsg = '';
  constructor(private alertService: AlertService,
              private loaderService: LoaderService,
              private reportingService: ReportingService,
              private router: Router,
              public dialog: MatDialog) {
    this.router.routeReuseStrategy.shouldReuseRoute = function() { return false; };
  }

  ngOnInit() {
    this.model.role = 'ALL';
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
      this.model.userId = reportFilters.userId;
      this.model.lastName = reportFilters.lastName;
      this.model.fromDate = reportFilters.fromDate;
      this.model.toDate = reportFilters.toDate;
      this.model.role = reportFilters.role;
    }
  }

  // Set Filters in Local Storage to Retain Report Information on Page Reload
  setReportFiltersInLocalStorage() {
    const reportDetail = {
      reportName: this.reportName,
      userId: this.model.userId,
      lastName: this.model.lastName,
      fromDate: this.model.fromDate,
      toDate: this.model.toDate,
      role: this.model.role
    };
    localStorage.setItem('reportDetail', JSON.stringify(reportDetail));
  }
// Set/Get Report Filter to Retain Info on Page Reload - End ----------------------------------------------

  applyFilter() {
    this.loaderService.display(true);
    this.response = [];
    this.resetChild();
    this.displayBackToTopBtn = false;
    this.showDetails = true;
    // Set Filters in Local Storage to Retain Report Information on Page Reload
    this.setReportFiltersInLocalStorage();
    let _filterFrom,  _filterTo = null;

    if (this.model.fromDate) {
      const _fDate = moment(this.model.fromDate).toISOString();
      _filterFrom = moment(_fDate).format('YYYY-MM-DD');
    }
    if (this.model.toDate) {
      const _tDate = moment(this.model.toDate).toISOString();
      _filterTo = moment(_tDate).format('YYYY-MM-DD');
    }
    this.reportingService.getLoggedInUser(this.model.userId, this.model.lastName, _filterFrom, _filterTo,
   this.model.role, this.paginationObj.currentOffSet, this.paginationObj.pageSize)
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          this.response = data.results;
          if (data.totalCount ===0) {
            this.noRecordFound = true;
          } else {
            this.noRecordFound = false;
          }
          this.paginationObj.totalRecords = data.totalCount;
          this.loaderService.display(false);
        },
        error => {
          this.noRecordFound = true;
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        });
  }


    clearFilter() {
        this.showDetails = false;
        this.response = [];
        this.model.userId = '';
        this.model.lastName = '';
        this.model.fromDate = '';
        this.model.toDate = '';
        this.edateMsg = '';
        this.sdateMsg = '';
        this.eDateErr = false;
        this.sDateErr = false;
      this.paginationObj = {
        pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
      this.paginationChildObj = {
        pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
      // Set Filters in Local Storage to Retain Report Information on Page Reload
      this.setReportFiltersInLocalStorage();
    }

  setSelectedIndex(index, details) {
  this.model.selectedIndex = index;
  this.details = details;
   this.getDetails(details);

  }

  saveDialog(): void {

    const dialogRef = this.dialog.open(SaveReportDialogComponent);
    dialogRef.afterClosed().takeUntil(this.unSubscribe).subscribe(result => {
      if (result !== '') {
    const reportObj  =this.createReportObj(result);
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
        let reportObj  =this.createReportObj(result);
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
      startDate : '',
      endDate : '',
      userLastName : '',
      userId : ''
    };
    Object.keys(params).forEach(function(key) {
      if (key === 'fromDate') {
        filteredParams.startDate = params[key];
      } else if (key === 'toDate') {
        filteredParams.endDate  = params[key];
      } else if (key === 'lastName') {
        filteredParams.userLastName  = params[key];
      } else if (key === 'userId') {
        filteredParams.userId  = params[key];
      } else if (key === 'role') {
        filteredParams.txtQuery = params[key];
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
  //   let filterParams = {   userId: '', userLastName: '', startDate: '',  endDate: '',   role: '' };
  //   filterParams.userId = this.model.userId === null || this.model.userId === undefined ? '' : this.model.userId;
  //   filterParams.userLastName = this.model.lastName === null || this.model.lastName === undefined ? '' : this.model.lastName;
  //   filterParams.startDate = fromdate;
  //   filterParams.endDate = todate;
  //   filterParams.role = this.model.role === null || this.model.role === undefined ? '' : this.model.role;
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
    const bodyData = document.getElementsByClassName('collapsible-body')[0];
    const csv = this.reportingService.createCsv(headerData, bodyData );
    const fileName = this.reportName + new Date().toISOString() + '.csv';
    this.reportingService.downloadReport(csv, fileName);

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

  updateChildPageSize(size) {
    this.paginationChildObj.pageSize = size;
    this.paginationChildObj.currentOffSet = 0;
    this.getDetails(this.details);
    this.scrollToElement = document.getElementById('childPager');
    this.scrollFunction(this.scrollToElement);

  }

  updateChildPage(event) {
    this.paginationChildObj.currentOffSet = event;
    this.getDetails(this.details);
    this.scrollToElement = document.getElementById('childPager');
    this.scrollFunction(this.scrollToElement);
  }





  getDetails(details) {
    this.loaderService.display(true);
    const resp = this.response;
    this.response = [];
    let _filterFrom,  _filterTo = null;

    if (this.model.fromDate) {
      const _fDate = moment(this.model.fromDate).toISOString();
      _filterFrom = moment(_fDate).format('YYYY-MM-DD');
    }
    if (this.model.toDate) {
      const _tDate = moment(this.model.toDate).toISOString();
      _filterTo = moment(_tDate).format('YYYY-MM-DD');
    }
    this.reportingService.getLogInLogOutUserDetails(details.userName, this.model.lastName, _filterFrom, _filterTo,
        this.model.role,  this.paginationChildObj.currentOffSet, this.paginationChildObj.pageSize)
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          this.response = resp;
          this.innerResponse = data.results;
          this.paginationChildObj.totalRecords = details.loginCount;
          if (this.paginationChildObj.totalRecords  > this.paginationChildObj.pageSize){
            this.showInnerPager = true;
          }


          this.loaderService.display(false);
        },
        error => {
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        });
  }

  scrollFunction(element) {
    this.scrollToElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
  }
  resetChild() {
    this.paginationChildObj = {
      pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
    this.innerResponse = null;
    this.model.selectedIndex = -1;
    this.showInnerPager = false;
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
