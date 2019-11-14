import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertService, LoaderService, ReportingService } from '@services/index';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { SaveReportDialogComponent } from '../save-report-dialog';
import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-authorized-contacts',
  templateUrl: './authorized-contacts.component.html',
  styleUrls: ['./authorized-contacts.component.scss']
})
export class AuthorizedContactsComponent implements OnInit, OnDestroy {

  response: any;
  reportName = 'authorized-contacts';
  showDetails = true;
  showNoRecord = false;
    isMyReport = false;
  private unSubscribe = new Subject();
    paginationObj = {
        pageSize : 50, currentOffSet : 0,  totalRecords: 0 };
    scrollToElement: any;
  constructor( private alertService: AlertService,
               private loaderService: LoaderService,
               private reportingService: ReportingService,
               private router: Router,
               public dialog: MatDialog) {
      this.router.routeReuseStrategy.shouldReuseRoute = function() { return false; };
  }

  ngOnInit() {
    this.loaderService.display(true);

    // Set Filters in Local Storage to Retain Report Information on Page Reload
    this.setReportFiltersInLocalStorage();
      if (localStorage.getItem('currentTab') !== null && localStorage.getItem('currentTab') !== undefined) {
          this.isMyReport = true;
      }
    this.getResults();

  }
  // Set Filters in Local Storage to Retain Report Information on Page Reload
   setReportFiltersInLocalStorage() {
       const reportDetail = {
           reportName: this.reportName
       };
       localStorage.setItem('reportDetail', JSON.stringify(reportDetail));
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
            filterParams: null,
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
    //     let filterParams = { };
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

    getResults() {
        this.loaderService.display(true);
        this.reportingService.getPagedAuthorizedContacts(this.paginationObj.currentOffSet,  this.paginationObj.pageSize).takeUntil(this.unSubscribe).subscribe(
            data => {
                this.response = data.results;
                if ( data.totalCount > 0) {
                    this.showNoRecord = false;
                } else {
                    this.showNoRecord = true;

                }
                this.paginationObj.totalRecords = data.totalCount;
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
        this.getResults();
        this.scrollToElement = document.getElementById('report_body');
        this.scrollFunction(this.scrollToElement);
    }

    updatePage(event) {
        this.paginationObj.currentOffSet = event;
        this.getResults();
        this.scrollToElement = document.getElementById('report_body');
        this.scrollFunction(this.scrollToElement);
    }

    scrollFunction(element) {
        this.scrollToElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
    }

}
