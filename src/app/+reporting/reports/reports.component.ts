import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ReportingService, LoaderService } from '../../services/index';
import { Subject } from 'rxjs/Subject';
@Component({
  selector: 'app-reports',
  templateUrl: 'reports.component.html',
  styleUrls: ['reports.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReportsComponent implements OnInit, OnDestroy  {

    model = {report : '', myReport:  {}};
  selectedTabIndex;
  baseReports = [] ;
  myReports = [];
  selectedReport: any = {};
  private unSubscribe = new Subject();

  constructor(public dialog: MatDialog, private reportService: ReportingService,
  private loaderService: LoaderService) {
  }



  ngOnInit() {
    this.loaderService.display(true);
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userId = JSON.parse(user).userId;
      this.reportService.getUserByUserId(userId).takeUntil(this.unSubscribe).subscribe(
          data => {
            if (data.email !== null && data.email !== undefined) {
              localStorage.setItem('userEmail', data.email);
            }



          },
          error => {
            console.log(error);
            this.loaderService.display(false);
          }
      );
    }

    this.reportService.getBaseReports().takeUntil(this.unSubscribe).subscribe(
        data => {

         this.baseReports = data;
          const reportDetails = JSON.parse(localStorage.getItem('reportDetail'));
          if (reportDetails) {
            switch (reportDetails.reportName) {
              case 'active-providers':
                this.selectedReport = this.filterReportByName('Associated Providers');
                break;
              case 'active-users':
                this.selectedReport = this.filterReportByName('Active Users By Date Range');
                break;
              case 'authorized-contacts':
                this.selectedReport = this.filterReportByName('Authorized Contacts');
                break;
              case 'high-volume-users':
                this.selectedReport = this.filterReportByName('High Volume Users');
                break;
              case 'login-logout-details':
                this.selectedReport = this.filterReportByName('Login-Logout Details');
                break;
              case 'net-exchange-usage':
                this.selectedReport = this.filterReportByName('NetExchange Usage');
                break;
              case 'no-activity-users':
                this.selectedReport = this.filterReportByName('No Activity Users');
                break;
              case 'participating-providers':
                this.selectedReport = this.filterReportByName('Participating Providers by Payer');
                break;
              case 'practice-facility-list':
                this.selectedReport = this.filterReportByName('Practice Facility List by Name');
                break;
              case 'top-100-transaction':
                this.selectedReport = this.filterReportByName('Top 100 Transaction Hour Peaks');
                break;
              case 'transaction-hour-averages':
                this.selectedReport = this.filterReportByName('Transaction Hour Averages');
                break;
              case 'transaction-totals':
                this.selectedReport = this.filterReportByName('Transaction Totals');
                break;
              case 'user-list-by-organization':
                this.selectedReport = this.filterReportByName('User List by Organization');
                break;
              case 'recent-transaction-success':
                this.selectedReport = this.filterReportByName('Recent Transactions');
                break;
              case 'concurrent-logged-users':
                this.selectedReport = this.filterReportByName('Concurrent Logged in Users');
                break;
            }
            this.model.report = this.selectedReport;

              this.selectedTabIndex = localStorage.getItem('currentTab') === 'myreport' ? 1 : 0;

              if (this.selectedTabIndex === 1) {
                  this.reportService.getUserReports().takeUntil(this.unSubscribe).subscribe(
                      responsesData => {
                          this.myReports = responsesData;
                          const myReportInfo = localStorage.getItem('MyReport') ;
                          if (myReportInfo) {
                              this.model.myReport = JSON.parse(myReportInfo);
                          }
                      },
                      error => {
                          console.log(error);
                          this.loaderService.display(false);
                      }
                  );
              }
          }
          this.loaderService.display(false);
        },
        error => {
         console.log(error);
          this.loaderService.display(false);
        }
    );



  }

  loadContents(index) {
    this.selectedReport = null;
    localStorage.removeItem('currentReport');
    localStorage.removeItem('reportDetail');
    if (index === 1) {
    localStorage.setItem('currentTab', 'myreport');
      this.reportService.getUserReports().takeUntil(this.unSubscribe).subscribe(
          data => {
           this.myReports = data;


          },
          error => {
            console.log(error);
            this.loaderService.display(false);
          }
      );
    } else {
      localStorage.removeItem('currentTab');
      localStorage.removeItem('MyReport');
      this.selectedReport = null;
      this.model.report = '';
    }
  }

  selectReport(event) {
    this.selectedReport = event.value;
    localStorage.setItem('currentReport', JSON.stringify(this.selectedReport));
  }

  selectMyReport(event) {
      this.loaderService.display(true);
      this.selectedReport = null;
      const contextRef = this;
      setTimeout(function() {

          const value = event.value;
          if (value !== '') {
              const reportArray = contextRef.baseReports.filter(x => x.baseReportId === value.baseReportId );
              if (reportArray.length > 0) {
                  contextRef.setReport(reportArray[0], JSON.parse(value.filterParams));
                  contextRef.selectedReport = reportArray[0];

                  localStorage.setItem('currentReport', JSON.stringify(contextRef.selectedReport));
                  localStorage.setItem('MyReport', JSON.stringify(value));
                  contextRef.loaderService.display(false);

              }

          } else {
              this.selectedReport = null;
              localStorage.removeItem('currentReport');
              contextRef.loaderService.display(false);

          }
      } , 1000);

  }

  filterReportByName(name) {
    let result: any;
    const arr = this.baseReports.filter(x => x.baseReportName === name);
    if (arr.length > 0) {
      result = arr[0];
    }
    return result;

  }


  setReport(baseReport , params) {

    let reportDetail: any = {};
    if (baseReport.baseReportName === 'Associated Providers') {
       reportDetail = {
        reportName: 'active-providers',
        groupType: params.breakDown,
        group: params.facilityName,
        taxId: params.taxId,
        payer: params.payerId
      };

    } else if (baseReport.baseReportName === 'Active Users By Date Range') {
       reportDetail = {
        reportName: 'active-users',
        userId: params.userId,
        lastName: params.userLastName,
        fromDate: params.startDate,
        toDate: params.endDate
      };
    } else if (baseReport.baseReportName === 'Authorized Contacts') {
      reportDetail = {
        reportName: 'authorized-contacts',
      };
    }  else if (baseReport.baseReportName === 'User List by Organization') {

        reportDetail = {
            reportName: 'user-list-by-organization',
            txtQuery: params.facilityName,
            userId: params.userId
        };
    } else if (baseReport.baseReportName === 'High Volume Users') {
        reportDetail = {
            reportName: 'high-volume-users',
            fromDate: params.startDate,
            toDate: params.endDate,
            volume: params.volume
        };
    } else if (baseReport.baseReportName === 'Login-Logout Details') {
        reportDetail = {
            reportName: 'login-logout-details',
            userId: params.userId,
            lastName: params.userLastName,
            fromDate: params.startDate,
            toDate: params.endDate
        };
    } else if (baseReport.baseReportName === 'NetExchange Usage') {
        reportDetail = {
            reportName: 'net-exchange-usage',
            groupType: params.breakDown,
            userId: params.userId,
            payer: params.payerName,
            dateFrom: params.startDate,
            dateTo: params.endDate
        };
    } else if (baseReport.baseReportName === 'No Activity Users') {
        reportDetail = {
            reportName: 'no-activity-users',
            dateFrom: params.startDate,
            dateTo: params.endDate
        };
    } else if (baseReport.baseReportName === 'Participating Providers by Payer') {
        reportDetail = {
            reportName: 'participating-providers'
        };
    } else if (baseReport.baseReportName === 'Practice Facility List by Name') {
        reportDetail = {
            reportName: 'practice-facility-list',
            status: params.status,
            txtQuery: params.facilityName
        };
    } else if (baseReport.baseReportName === 'Top 100 Transaction Hour Peaks') {
        reportDetail = {
            reportName: 'top-100-transaction',
            userPayer: params.payerName,
            filterFrom: params.startDate,
            filterTo: params.endDate
        };
    } else if (baseReport.baseReportName === 'Transaction Hour Averages') {
        reportDetail = {
            reportName: 'transaction-hour-averages',
            payerId: params.payerId,
            fromDate: params.startDate,
            toDate: params.endDate,
            userType: params.userType
        };
    }  else if (baseReport.baseReportName === 'Transaction Totals') {
        reportDetail = {
            reportName: 'transaction-totals',
            groupBy: params.breakDown,
            userId: params.userId,
            lastName: params.userLastName,
            txtQuery: params.groupName,
            payerName: params.payerName,
            startDate: params.startDate,
            endDate: params.endDate
        };
    } else if (baseReport.baseReportName === 'Recent Transactions') {
        reportDetail = {
            reportName: 'recent-transaction-success',
            timePeriod: params.timePeriod,
            transactionType: params.breakDown,
            payerName: params.payerName,

        };
    } else if (baseReport.baseReportName === 'Concurrent Logged in Users') {
        reportDetail = {
            reportName: 'concurrent-logged-users',
            timePeriod: params.timePeriod

        };
    }

    localStorage.setItem('reportDetail', JSON.stringify(reportDetail));

  }

  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
}
