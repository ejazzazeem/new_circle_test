import {Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { AlertService, LoaderService, ReportingService, ViewAllPayersService } from '@services/index';
import {Subject} from 'rxjs/Subject';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { SaveReportDialogComponent } from '../save-report-dialog';
import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';
import * as _ from 'lodash';
@Component({
    selector: 'app-user-list-by-organization',
    templateUrl: './user-list-by-organization.component.html',
    styleUrls: ['./user-list-by-organization.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UserListByOrganizationComponent implements OnInit, OnDestroy {
    @ViewChild('myTable') table: any;
    model = {
        userId: ''
    };

    selectedIndex: any;
    sortParams = {
        keyword: '',
        sortField: {
            page: {
                offSet: 0,
                size: 10000
            },
            sortField: {
                fieldName: 'name',
                sortOrder: 'ASC'
            }
        }
    };
    showHideTable = false;
    expandOrCollapse = true;
    userListByOrganization: any;
    // autocomplete for search
    txtQuery = '';
    txtQueryChanged: Subject<string> = new Subject<string>();
    searchResult: any = [];
    reportName = 'user-list-by-organization';
    isMyReport = false;
    noRecordFound = false;
    paginationObj = {
        pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
    paginationChildObj = {
        pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
    details: any;
    showInnerPager = false;
    innerResponse: any;
    scrollToElement: any;
    private unSubscribe = new Subject();

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
            this.txtQuery = reportFilters.txtQuery;
            this.model.userId = reportFilters.userId;
        }
    }


    // Set Filters in Local Storage to Retain Report Information on Page Reload
    setReportFiltersInLocalStorage() {
        const reportDetail = {
            reportName: this.reportName,
            txtQuery: this.txtQuery,
            userId: this.model.userId,
        };
        localStorage.setItem('reportDetail', JSON.stringify(reportDetail));
    }
// Set/Get Report Filter to Retain Info on Page Reload - End ----------------------------------------------

    displayName(user) {
        if (!user.lastName && !user.firstName) {
            return '. . . . . . .';
        } else {
            return (user.lastName ? user.lastName : '')
                + (user.firstName && user.lastName ? ', ' : '')
                + (user.firstName ? user.firstName : '') ;
        }
    }


    onFieldChange(query: string) {
        this.txtQueryChanged.next(query);
    }

    onSearchChange(searchValue: string) {
        if (searchValue !== '') {
            const groupOrPayerResponse = [];
            this.sortParams.keyword = searchValue;
            this.reportingService.getAllGroups(this.sortParams.keyword).takeUntil(this.unSubscribe).subscribe(response => {
                response.forEach( group => {
                    groupOrPayerResponse.push(group);
                });
            });
            this.payersService.getAllPayers(this.sortParams).takeUntil(this.unSubscribe).subscribe(response => {
                response.results.forEach( group => {
                    groupOrPayerResponse.push(group);
                });
            });

            this.searchResult = groupOrPayerResponse;
        } else {
            this.sortParams.keyword = '';
            this.searchResult = null;
            this.txtQuery = '';
        }
    }

    clearFilter() {
        this.userListByOrganization = [];
        this.model = {
            userId: ''
        };
        this.txtQuery = '';
        this.showHideTable = false;
        this.paginationObj = {
            pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
        this.paginationChildObj = {
            pageSize :50, currentOffSet : 0,  totalRecords: 0 };
        // Set Filters in Local Storage to Retain Report Information on Page Reload
        this.setReportFiltersInLocalStorage();
    }

    setSelectedIndex(index, details) {
       this.selectedIndex = index;
       this.details = details;
       this.getDetails(details);

    }

    applyFilter() {
        this.loaderService.display(true);
        this.showHideTable = true;
        this.userListByOrganization = [];
this.resetChild();
        // Set Filters in Local Storage to Retain Report Information on Page Reload
        this.setReportFiltersInLocalStorage();



        this.reportingService.getPaginatedFacilityNames(this.model.userId, this.txtQuery, this.paginationObj.currentOffSet, this.paginationObj.pageSize)
            .takeUntil(this.unSubscribe).subscribe(
            data => {
               this.userListByOrganization = data.results;
               this.paginationObj.totalRecords = data.totalCount;
                this.noRecordFound = (this.paginationObj.totalRecords > 0) ? false : true;
                this.loaderService.display(false);
            },
            error => {
                this.noRecordFound = true;
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            });
    }

    saveDialog(): void {

        const dialogRef = this.dialog.open(SaveReportDialogComponent);
        dialogRef.afterClosed().takeUntil(this.unSubscribe).subscribe(result => {
            if (result !== '') {
              const reportObj =  this.createReportObj(result);
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
                const reportId = JSON.parse(localStorage.getItem('MyReport')).userReportId;
                let reportObj =  this.createReportObj(result);
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
            userId : '',
            facilityName : ''
        };
        Object.keys(params).forEach(function(key) {
            if (key === 'userId') {
                filteredParams.userId = params[key];
            } else  {
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
    //     const baseReport = JSON.parse(localStorage.getItem('currentReport'));
    //     let filterParams ={ userId: '', facilityName : '' };
    //     filterParams.userId = this.model.userId === null || this.model.userId === undefined ? '' : this.model.userId;
    //     filterParams.facilityName =  this.txtQuery;
    //     if (e === '1') {
    //         this.reportingService.downloadReportPdf(baseReport, filterParams, this.reportName);
    //     } else {
    //         this.reportingService.downloadReportCSV(baseReport, filterParams, this.reportName);
    //     }
    // }

    downloadReport(e) {
        (e === '1') ? this.print() : this.downloadCSV();
    }

    print() {
        this.expandOrCollapse = true;
        this.selectedIndex = - 1;
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

    getDetails(details) {

        this.loaderService.display(true);
        const resp = this.userListByOrganization;
        this.userListByOrganization = [];
        this.reportingService.getPaginatedUsersByFacilityNames(this.model.userId, this.txtQuery, details, this.paginationChildObj.currentOffSet, this.paginationChildObj.pageSize)
            .takeUntil(this.unSubscribe).subscribe(
            data => {
             this.userListByOrganization = resp;
             this.innerResponse = data.results;
                this.paginationChildObj.totalRecords = data.totalCount;
                if (this.paginationChildObj.totalRecords  >= this.paginationChildObj.pageSize) {
                    this.showInnerPager = true;
                }


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
        this.selectedIndex = -1;
        this.applyFilter();
        this.scrollToElement = document.getElementById('reportDiv');
        this.scrollFunction(this.scrollToElement);
    }

    updatePage(event) {
        this.paginationObj.currentOffSet = event;
        this.selectedIndex = -1;
        this.applyFilter();
        this.scrollToElement = document.getElementById('reportDiv');
        this.scrollFunction(this.scrollToElement);
    }
    updateChildPageSize(size) {
        this.paginationChildObj.pageSize = size;
        this.paginationChildObj.currentOffSet = 0;
        this.getDetails(this.details);
        this.scrollToElement = document.getElementById('reportDiv');
        this.scrollFunction(this.scrollToElement);
    }

    updateChildPage(event) {
        this.paginationChildObj.currentOffSet = event;
        this.getDetails(this.details);
        this.scrollToElement = document.getElementById('reportDiv');
        this.scrollFunction(this.scrollToElement);
    }

    scrollFunction(element) {
        this.scrollToElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
    }

    resetChild() {
        this.paginationChildObj = {
            pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
        this.innerResponse = null;
        this.selectedIndex = -1;
        this.showInnerPager = false;
    }
}
