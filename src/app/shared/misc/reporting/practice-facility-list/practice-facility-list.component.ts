import {Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild} from '@angular/core';
import { AlertService, LoaderService, ReportingService } from '@services/index';
import { Subject } from 'rxjs/Rx';
import {MatAutocompleteTrigger} from '@angular/material';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { SaveReportDialogComponent } from '../save-report-dialog';
import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';
@Component({
  selector: 'app-practice-facility-list',
  templateUrl: './practice-facility-list.component.html',
  styleUrls: ['./practice-facility-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PracticeFacilityListComponent implements OnInit, OnDestroy {
  @ViewChild('autoCompleteInput', { read: MatAutocompleteTrigger })
  autoComplete: MatAutocompleteTrigger;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new  Subject();

  model: any = {};
  private unSubscribe = new Subject();
  count = 0;
  facilityList: any = [];
  keyword: any;
  // autocomplete for search
  txtQuery = '';
  txtQueryChanged: Subject<string> = new Subject<string>();
  searchResult: any = [];
  showHideTable = false;
  reportName = 'practice-facility-list';
  isMyReport = false;
  noRecordFound = false;
  paginationObj = {
    pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
  scrollToElement: any;
  constructor(private alertService: AlertService,
              private loaderService: LoaderService,
              private reportingService: ReportingService,
              private router: Router,
              public dialog: MatDialog) {
    this.router.routeReuseStrategy.shouldReuseRoute = function() { return false; };
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

  onFieldChange(query: string) {
    this.txtQueryChanged.next(query);
  }

  onSearchChange(searchValue: string) {
    if (searchValue !== '') {
      this.keyword = searchValue;
      this.reportingService.getAllGroups(this.keyword).takeUntil(this.unSubscribe).subscribe(response => {
        this.searchResult = response;
      });
    } else {
      this.keyword = '';
      this.searchResult = null;
      this.txtQuery = '';

    }
  }

  ngOnInit() {
    // Set/Get Report Filter to Retain Info on Page Reload
    this.getReportFiltersFromLocalStorage();
    if (localStorage.getItem('currentTab') !== null && localStorage.getItem('currentTab') !== undefined) {
      this.isMyReport = true;
      this.requestFacilityList();
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
      this.txtQuery = reportFilters.txtQuery;
      this.model.status = reportFilters.status;
    }
  }

  // Set Filters in Local Storage to Retain Report Information on Page Reload
  setReportFiltersInLocalStorage() {
    const reportDetail = {
      reportName: this.reportName,
      status: this.model.status,
      txtQuery: this.txtQuery
    };
    localStorage.setItem('reportDetail', JSON.stringify(reportDetail));
  }
// Set/Get Report Filter to Retain Info on Page Reload - End ----------------------------------------------

  requestFacilityList() {
    this.loaderService.display(true);
    this.facilityList = [];
    this.showHideTable = true;
    // Set Filters in Local Storage to Retain Report Information on Page Reload
    this.setReportFiltersInLocalStorage();

    this.count = 0;
    this.reportingService.getPagedPracticeFacilityListByName(this.txtQuery, this.model.status,this.paginationObj.currentOffSet,  this.paginationObj.pageSize).takeUntil(this.unSubscribe).subscribe(
        data => {
          this.facilityList = data.results;
          this.paginationObj.totalRecords = data.totalCount;
            this.count = this.facilityList.length;
            if (this.count === 0) {
              this.noRecordFound = true;
            } else {
              this.noRecordFound = false;
            }
          this.loaderService.display(false);
        }, error => {
          this.noRecordFound = true;
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        }
    );
  }
  clearFilter() {
    this.txtQuery = '';
    this.model.status = '';
    this.facilityList = [];
    this.count = 0;
    this.showHideTable = false;
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
      status: '',
      facilityName: ''
    };
    Object.keys(params).forEach(function(key) {
      if (key === 'status') {
        filteredParams.status = params[key];
      } else if (key === 'txtQuery') {
        filteredParams.facilityName  = params[key];
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

  //
  // downloadReport(e) {
  //   const baseReport = JSON.parse(localStorage.getItem('currentReport'));
  //   let filterParams = {'facilityName': '',   status: ''};
  //   filterParams.facilityName = this.txtQuery === null || this.txtQuery === undefined ? '' : this.txtQuery;
  //   filterParams.status = this.model.status === null || this.model.status === undefined ? '' : this.model.status;
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
    this.requestFacilityList();
    this.scrollToElement = document.getElementById('reportDiv');
    this.scrollFunction(this.scrollToElement);
  }

  updatePage(event) {
    this.paginationObj.currentOffSet = event;
    this.requestFacilityList();
    this.scrollToElement = document.getElementById('reportDiv');
    this.scrollFunction(this.scrollToElement);
  }
  scrollFunction(element) {
    this.scrollToElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
  }
}
