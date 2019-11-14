import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs/Rx';
import { AlertService, LoaderService, ReportingService } from '@services/index';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { SaveReportDialogComponent } from '../save-report-dialog';
import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';
import * as moment from 'moment';
declare function isNumberKey(e, target): any;
declare function isValidDate(e): any;
@Component({
  selector: 'app-no-activity-users',
  templateUrl: './no-activity-users.component.html',
  styleUrls: ['./no-activity-users.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NoActivityUsersComponent implements OnInit, OnDestroy {
  private unSubscribe = new Subject();
  notActiveUsers: any = [];
  reportName = 'no-activity-users';
    isMyReport = false;
    model: any = {dateFrom: new Date(), dateTo: new Date()};
    showTable = false;
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
               private router: Router,
               public dialog: MatDialog) {
      this.router.routeReuseStrategy.shouldReuseRoute = function() { return false; };
  }

  ngOnInit() {
    this.notActiveUsers = [];
    const currentDate = new Date();
    const timespan = currentDate.getTime() - (188 * 86400000);
    this.model.dateFrom = new Date(timespan);
    // Set Filters in Local Storage to Retain Report Information on Page Reload
    this.getReportFiltersFromLocalStorage();



      if (localStorage.getItem('currentTab') !== null && localStorage.getItem('currentTab') !== undefined) {
          this.isMyReport = true;
          this.applyFilter();
      }

  }
    applyFilter() {
        this.loaderService.display(true);
        this.setReportFiltersInLocalStorage();
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
        this.reportingService.getPagedNoActivityUsers(fromDate, toDate, this.paginationObj.currentOffSet,  this.paginationObj.pageSize).takeUntil(this.unSubscribe).subscribe(
            data => {
                this.notActiveUsers = data.results;
                this.noRecordFound  = data.totalCount > 0 ? false : true;
                this.showTable = true;
                this.paginationObj.totalRecords = data.totalCount;
                this.loaderService.display(false);
            }, error => {
                this.loaderService.display(false);
                this.showTable = false;
                this.noRecordFound  = true;
                this.alertService.error(error.error.errors[0].endUserMessage);
            });
    }
    clearFilter() {
      this.model.dateTo = new Date();
        const currentDate = new Date();
        const timespan = currentDate.getTime() - (188 * 86400000);
        this.model.dateFrom = new Date(timespan);
        this.notActiveUsers = [];
        this.showTable = false;
        this.sdateMsg = '';
        this.edateMsg = '';
        this.sDateErr = false;
        this.eDateErr = false;
        this.paginationObj = {
            pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
    }
  // Set Filters in Local Storage to Retain Report Information on Page Reload
  setReportFiltersInLocalStorage() {
    const reportDetail = {
      reportName: this.reportName,
        dateFrom: this.model.dateFrom,
        dateTo: this.model.dateTo
    };
    localStorage.setItem('reportDetail', JSON.stringify(reportDetail));
  }
    // Set/Get Report Filter to Retain Info on Page Reload - Start ----------------------------------------------
    getReportFiltersFromLocalStorage() {
        // Get Report Data from local storage if available, else set default data for this report
        const reportFilters = JSON.parse(localStorage.getItem('reportDetail'));
        if (!reportFilters || reportFilters.reportName !== this.reportName) {
            // Set Filters in Local Storage to Retain Report Information on Page Reload
            this.setReportFiltersInLocalStorage();
        } else {
            this.model.dateFrom = reportFilters.dateFrom;
            this.model.dateTo = reportFilters.dateTo;
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
            endDate : ''
        };
        Object.keys(params).forEach(function(key) {
            if (key === 'dateFrom') {
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
            emails.push(result.emails[0]);
        }

        const reportObj = {
            userReportId: null,
            userId : userId,
            baseReportId: baseReport.baseReportId,
            userReportName: result.reportName,
            filterParams:  JSON.stringify( filteredParams),
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
    //     const baseReport = JSON.parse(localStorage.getItem('currentReport'));
    //     let todate, fromdate;
    //     if (this.model.dateTo) {
    //         const _todate =  moment(this.model.dateTo).toISOString();
    //         todate = moment(_todate).format('YYYY-MM-DD');
    //     } else {
    //         todate = '';
    //     }
    //
    //     if (this.model.dateFrom) {
    //         const _fromdate =  moment(this.model.dateFrom).toISOString();
    //         fromdate = moment(_fromdate).format('YYYY-MM-DD');
    //     } else {
    //         fromdate = '';
    //     }
    //     let filterParams =  {startDate: '',   endDate: '' };
    //     filterParams.startDate = fromdate;
    //     filterParams.endDate = todate;
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
        const printContents = document.getElementById('report_body').innerHTML;
        setTimeout(this.reportingService.printReport(printContents) , 2000);
    }

    downloadCSV() {
        const headerData = document.getElementsByClassName('collapsible-head')[0];
        const bodyData = document.getElementsByClassName('collapsible-body')[0];
        const csv = this.reportingService.createCsv(headerData, bodyData );
        const fileName = this.reportName + new Date().toISOString() + '.csv';
        this.reportingService.downloadReport(csv, fileName);

    }
    // date validation
    handledate(e) {
        return isNumberKey(e, e.target);
    }


    updatePageSize(size) {
        this.paginationObj.pageSize = size;
        this.paginationObj.currentOffSet = 0;
        this.applyFilter();
        this.scrollToElement = document.getElementById('report_body');
        this.scrollFunction(this.scrollToElement);
    }

    updatePage(event) {
      this.paginationObj.currentOffSet = event;
      this.applyFilter();
        this.scrollToElement = document.getElementById('report_body');
        this.scrollFunction(this.scrollToElement);
    }

    scrollFunction(element) {
        this.scrollToElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
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
