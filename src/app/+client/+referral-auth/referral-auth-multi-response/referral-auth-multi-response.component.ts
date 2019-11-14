import { Component, OnInit, ViewEncapsulation, AfterViewInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { LoaderService, AlertService, DataSharingService, UtilsService,
  SharedService } from '@services/index';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-referral-auth-multi-response',
  templateUrl: './referral-auth-multi-response.component.html',
  styleUrls: ['./referral-auth-multi-response.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class ReferralAuthMultiResponseComponent implements OnInit, AfterViewInit, OnDestroy {

  // The trigger needed to re-render the table
  dtTrigger: Subject<any> = new Subject();

  model: any = [];
  categoryStatus: string;
  categoryCode: string;
  rejectionDetails = '';

  noResponseData: any = [];
  columnDefs = [
    {targets: [8], visible: false},
    {targets: '_all', visible: true}
  ];

  // options required for the data table showing record
  dtOptions: DataTables.Settings = {};

  private unSubscribe = new Subject();


  constructor(private loaderService: LoaderService,
              private alertService: AlertService,
              private router: Router,
              private dataSharingService: DataSharingService,
              private sharedService: SharedService,
              private cdr: ChangeDetectorRef,
              // private referralAuthService: ReferralAuthService,
              private utils: UtilsService) { }

  ngAfterViewInit() {
    this.dtTrigger.next();
  }

  ngOnInit() {
    // Get Subscriber or Member Information if no response occurs
    this.dataSharingService.getNoResponseFromPayerDetail
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          this.noResponseData = data;
        }, error => {
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        });

    // this.referralAuthService.getReferralAuthMultipleResponseData()
    this.dataSharingService.getMultipleResponse
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          if (Object.keys(data).length < 1) {
            this.router.navigate(['/client/referral-auth/inquiry']);
          } else {
            this.model = data;
            this.cdr.detectChanges();

            this.model.referralAuth.forEach(referralAuthObj => {
              // Set the name of category code according to response received
              this.setCategoryCode(referralAuthObj.categoryCode);

              // Set event dates as start and end date to display on UI.
              if (referralAuthObj.certificationEffectiveDate) {
                if (referralAuthObj.certificationEffectiveDate.includes('-')) {
                  const serviceDateData = referralAuthObj.certificationEffectiveDate.split('-');
                  referralAuthObj['startDate'] = serviceDateData[0];
                  referralAuthObj['endDate'] = serviceDateData[1];
                } else {
                  referralAuthObj['startDate'] = referralAuthObj.certificationEffectiveDate;
                  referralAuthObj['endDate'] = '';
                }
              } else {
                referralAuthObj['startDate'] = '';
                referralAuthObj['endDate'] = '';
              }
                if (referralAuthObj.categoryCode === '') {
                  this.setCategoryCode(this.noResponseData['referralAuthInformation'].categoryCode);
                }
            });

            // ---- CHECK FOR AAA REJECTIONS - START ------------------------------------------------------------------
            // find AAA Rejections if they exist in the response ----------------------------------------
            let AAARejectionArray = [];
            AAARejectionArray = this.utils.findAAARejections(this.model, AAARejectionArray);
            // if rejection code is present then implement this code
            if (AAARejectionArray.length !== 0) {
              this.columnDefs = [
                {targets: [6, 7], visible: false},
                {targets: '_all', visible: true}
              ];

              AAARejectionArray.forEach(eachRejection => {
                // Service call to fetch the reject reason code and followup code display message
                this.sharedService
                    .getAAARejectionDisplayMessage(eachRejection.rejectReasonCode, eachRejection.followupActionCode)
                    .takeUntil(this.unSubscribe).subscribe(
                    AAARejectionMessage => {
                      this.rejectionDetails = this.utils.getRejectionDisplayMessage(AAARejectionMessage, this.rejectionDetails);
                    },
                    error => {
                      this.alertService.error(error.error.errors[0].endUserMessage);
                    }
                );
              });
            }
            // ---- CHECK FOR AAA REJECTIONS - END ---------------------------------------------------------------------
          }
        }, error => {
          this.alertService.error(error.error.erros[0].endUserMessage);
        });

    this.setDtOptions();
  }

  setDtOptions() {
    // options required for the data table showing record
    this.dtOptions = {
      scrollY: '280px',
      scrollCollapse: true,
      searching: false,
      info: false,
      lengthChange: true,
      ordering: false,
      paging: false,
      language: {
        emptyTable: 'No Referral/Auth Response Found'
      },
      columnDefs: this.columnDefs
    };
  }

  setCategoryCode (categoryCode) {
    if (categoryCode === 'SC' || categoryCode === 'Specialty Care Review') {
      this.categoryCode = 'Referral';
      this.categoryStatus = 'Referral';
    } else if (categoryCode === 'AR' || categoryCode === 'Admission Review' ||
        categoryCode === 'HS' || categoryCode === 'Health Services Review') {
      this.categoryCode = 'Pre-Authorization';
      this.categoryStatus = 'Authorization';
    }
  }

  /**
   * @ngdoc method
   * @name populateReferringServicingProviderName
   * @methodOf healtheNet.ui.component: ReferralAuthMultiResponseComponent
   * @description
   * Populate the tables with Referring and Servicing Providers names
   */
  populateReferringServicingProviderName(memberName) {
    if (memberName.family && memberName.given) {
      return memberName.family + ', ' + memberName.given;
    } else if (memberName.family && !memberName.given) {
      return memberName.family;
    } else if (!memberName.family && memberName.given) {
      return memberName.given;
    } else {
      return '. . . . . . .';
    }
  }

  /**
   * @ngdoc method
   * @name populateMemberName
   * @methodOf healtheNet.ui.component: ReferralAuthMultiResponseComponent
   * @description
   * Populate the tables with appropriate member names
   */
  populateMemberName(memberName) {
    if (!memberName.family && !memberName.given && !memberName.middle) {
      return '. . . . . . .';
    } else if (memberName.family && !memberName.given && !memberName.middle) {
      return memberName.family;
    } else if (!memberName.family && (memberName.given || memberName.middle)) {
      return `${memberName.given} ${memberName.middle}` ;
    } else {
      return `${memberName.family}, ${memberName.given} ${memberName.middle}`;
    }
  }

  populateServicingProviderName(memberName, isdetails) {
      if (!isdetails) {
      if (memberName.family && memberName.given) {
        return memberName.family + ', ' + memberName.given;
      } else if (memberName.family && !memberName.given) {
        return memberName.family;
      } else if (!memberName.family && memberName.given) {
        return memberName.given;
      } else {
        return '. . . . . . .';
      }
    } else {
        return (memberName === null || memberName === undefined) ? '. . . . . . .' : memberName[0].serviceProvider;
      }

  }
  /**
   * @ngdoc method
   * @name navigateToDetailsPage
   * @methodOf healtheNet.ui.component: ReferralAuthMultiResponseComponent
   * @description
   * Set data in observable through data sharing service and
   * navigate to claim status details page.
   */
  navigateToDetailsPage(index) {
    // If there is no AAA message received only then Navigate to single response
    if (!this.rejectionDetails) {
      const dataArray = [];
      this.model.referralIndexInList = index;
      dataArray.push(this.model);
      this.dataSharingService.setSingleResponseDetail(this.model);
      this.router.navigate(['client/referral-auth/detail']);
    }
  }

  // unSubscribe the observables to avoid memory leaks
  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
}

