import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AlertService, LoaderService, ReportingService, ViewAllPayersService, GroupListService } from '@services/index';
import { Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { SaveReportDialogComponent } from '../save-report-dialog';
import { MatAutocompleteTrigger} from '@angular/material';
import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-active-providers',
  templateUrl: './active-providers.component.html',
  styleUrls: ['./active-providers.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ActiveProvidersComponent implements OnInit, OnDestroy {
  @ViewChild('autoCompleteInput', { read: MatAutocompleteTrigger })
  autoComplete: MatAutocompleteTrigger;
  @ViewChild('myTable') table: any;

  model = {
    groupType: 'facilityName',
    taxId: '',
    payer: '',
    userId: '',
    selectedIndex: -1
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

  activeProvidersList = [];
  appliedFilter: string;
  activeProviders: any;
  payerList: any;
  groupList: any;
  open = false;
  showHideTable = false;
  private unSubscribe = new Subject();
// autocomplete for search
  txtQuery = '';
  txtQueryChanged: Subject<string> = new Subject<string>();
  searchResult: any = [];
  reportName = 'active-providers';
  isMyReport = false;
  noRecordFound = false;
    paginationObj = {
        pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
    scrollToElement: any;
  constructor(private alertService: AlertService,
              public dialog: MatDialog,
              private loaderService: LoaderService,
              private reportingService: ReportingService,
              private payersService: ViewAllPayersService,
              private router: Router) {
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
    this.loaderService.display(true);
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
      this.model.taxId = reportFilters.taxId;
      this.model.payer = reportFilters.payer;
      this.txtQuery = reportFilters.group;
    }
  }

  // Set Filters in Local Storage to Retain Report Information on Page Reload
  setReportFiltersInLocalStorage() {
    const reportDetail = {
      reportName: this.reportName,
      groupType: this.model.groupType,
      group: this.txtQuery,
      taxId: this.model.taxId,
      payer: this.model.payer
    };
    localStorage.setItem('reportDetail', JSON.stringify(reportDetail));
  }
// Set/Get Report Filter to Retain Info on Page Reload - End ----------------------------------------------

  displayProviderName(activeProvider) {
    if (!activeProvider.lastName && !activeProvider.firstName) {
      return '. . . . . . .';
    } else {
      return (activeProvider.lastName ? activeProvider.lastName : '')
          + (activeProvider.firstName && activeProvider.lastName ? ', ' : '')
          + (activeProvider.firstName ? activeProvider.firstName : '') ;
    }
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

  applyFilter() {
    this.loaderService.display(true);
    if (this.model.groupType === 'taxId') {
      this.txtQuery = '';
      this.model.userId = '';
    } else if (this.model.groupType === 'facilityName') {
      this.model.taxId = '';
        this.model.userId = '';
    } else {
        this.txtQuery = '';
        this.model.taxId = '';
    }
    this.showHideTable = true;
    // Set Filters in Local Storage to Retain Report Information on Page Reload
    this.setReportFiltersInLocalStorage();

    this.appliedFilter = this.model.groupType;
    this.activeProviders = [];
    this.activeProvidersList = [];

    let validationError = '';
    switch (this.appliedFilter) {
      case 'facilityName' : validationError  =  (this.txtQuery.length === 0) ? 'Facility Name ' : ''; break;
      case 'taxId': validationError =  (this.model.taxId.length === 0) ? 'Tax ID' : '';break;
      case 'byuser': validationError =  (this.model.userId.length === 0) ? 'User ID' : '';break;
      default: validationError  = '';
    }
    if (validationError !== '') {

        this.loaderService.display(false);
        this.alertService.error(validationError + ' is required');
        return false;

    }
    this.reportingService.associatedProviders(this.txtQuery, this.model.taxId, this.model.userId, this.model.payer,
    this.appliedFilter, this.paginationObj.pageSize, this.paginationObj.currentOffSet)
        .takeUntil(this.unSubscribe).subscribe(
        data => {
            this.showHideTable = true;
            if (data.totalCount === 0) {
                this.noRecordFound = true;
                this.activeProviders = [];
            } else {
                this.noRecordFound = false;
                this.activeProviders = data.results;
            }
            this.paginationObj.totalRecords = data.totalCount;
          this.loaderService.display(false);
        },
        error => {
          this.noRecordFound = false;
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        });
  }
  setSelectedIndex(index, providerDetails) {
    if (this.model.selectedIndex !== index && providerDetails.length > 1) {
      this.model.selectedIndex = index;
    } else {
      this.model.selectedIndex = -1;
    }


  }

  displayAddress(address) {
    return address.line1 + ' ' + address.line2 + ' ' + address.city + ', ' + address.state + ', ' + address.zipCode;
  }


  clearFilter() {
    this.txtQuery = '';
    this.activeProviders = [];
    this.activeProvidersList = [];
    this.appliedFilter = 'facilityName';
    this.model.payer = '';
    this.model.taxId = '';
    this.model.groupType = 'facilityName';
    this.showHideTable = false;
      this.paginationObj = {
          pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
    // Set Filters in Local Storage to Retain Report Information on Page Reload
    this.setReportFiltersInLocalStorage();
  }


  // Save to My Reports Dialog
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
      reportObj .userReportId = reportId;
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
      facilityName: '',
      taxId : '',
      payerId: '',
    };
    Object.keys(params).forEach(function(key) {
      if (key === 'groupType') {
        filteredParams.breakDown = params[key];
      } else if (key === 'group') {
        filteredParams.facilityName  = params[key];
      } else if (key === 'taxId') {
        filteredParams.taxId  = params[key];
      } else {
        filteredParams.payerId  = params[key];
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


  // downloadReport(e) {
  //   const baseReport = JSON.parse(localStorage.getItem('currentReport'));
  //   let filterParams = {  breakDown: '', facilityName: '', taxId: '', userId: '', payerName: '' };
  //   filterParams.breakDown = this.appliedFilter;
  //   if (this.appliedFilter === 'facilityName') {
  //     filterParams.facilityName = this.txtQuery;
  //   } else if (this.appliedFilter === 'taxId') {
  //     filterParams.taxId = this.model.taxId;
  //   } else if (this.appliedFilter === 'byuser') {
  //     filterParams.userId = this.model.userId;
  //   }
  //   filterParams.payerName = this.model.payer;
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

    scrollFunction(element) {
        this.scrollToElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
    }

}
