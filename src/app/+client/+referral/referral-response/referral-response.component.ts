/**
 * Created by Mehwish on 4/3/2018.
 */
import {Component, OnInit, ViewEncapsulation, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { AlertService, LoaderService, DataSharingService, SharedService,
    UtilsService} from '@services/index';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-referral-response',
    templateUrl: './referral-response.component.html',
    styleUrls: ['./referral-response.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class ReferralResponseComponent implements OnInit, OnDestroy {

    payerInformation: any;
    servicingProvider: any;
    referringProvider: any;
    referralInfo: any;
    subscriberMember: any;
    eventStartDate: any;
    eventEndDate: any;
    transactionData: any;
    goOnTop = false;
    selectedTab: 1;
    label: any;
    rejectionDetails = '';
    private unSubscribe = new Subject();

    constructor(private alertService: AlertService,
                private loaderService: LoaderService,
                private dataService: DataSharingService,
                private sharedService: SharedService,
                private router: Router,
                private cdr: ChangeDetectorRef,
               // private referralService: ReferralRequestService,
                private utils: UtilsService) {
    }

    ngOnInit() {
        this.loaderService.display(true);
      //  this.referralService.getReferralDetailsData().takeUntil(this.unSubscribe).subscribe( // service for mock data
         this.dataService.getSingleResponseDetail.takeUntil(this.unSubscribe).subscribe(
            data => {
                if (Object.keys(data).length === 0) {
                    this.router.navigate(['/client/referral/request']);
                } else {
                    const response = data[0];
                    this.cdr.detectChanges();

                    this.showHideBackToTopButton(false, 1);
                    this.payerInformation = response.payer;
                    this.transactionData = response.transactionInfo;
                    this.referringProvider = response.requestingProvider;
                    this.referralInfo = response.referralAuth;
                    this.subscriberMember = response.subscriber;

                    if (this.referralInfo) {
                        this.referralInfo.forEach(eachReferral => {
                            if (eachReferral.eventDate) {
                                this.eventStartDate = eachReferral.eventDate.substr(0, 8);
                                this.eventEndDate = eachReferral.eventDate.substr(8, 15);
                            }
                            if (eachReferral.servicingProvider) {
                                this.servicingProvider = eachReferral.servicingProvider;

                                    if (this.servicingProvider.contactInfo) {
                                        this.servicingProvider.contactInfo.forEach(eachContact => {
                                            switch (eachContact.label) {
                                                case 'TE':
                                                    this.label = 'Telephone';
                                                    break;
                                                case 'FX':
                                                    this.label = 'Fax';
                                                    break;
                                                case 'EM':
                                                    this.label = 'E-mail';
                                                    break;
                                                case 'UR':
                                                    this.label = 'URL';
                                                    break;
                                                default:
                                                    this.label = eachContact.label;
                                                    break;
                                            }
                                        });
                                    }
                            }
                        });
                    }

                    // ---- CHECK FOR AAA REJECTIONS - START ------------------------------------------------------------------
                    // find AAA Rejections if they exist in the response ----------------------------------------
                    let AAARejectionArray = [];
                    AAARejectionArray = this.utils.findAAARejections(response, AAARejectionArray);
                    // if rejection code is present then implement this code
                    if (AAARejectionArray.length !== 0) {
                        AAARejectionArray.forEach(eachRejection => {
                            // Service call to fetch the reject reason code and followup code display message
                            this.sharedService
                                .getAAARejectionDisplayMessage(eachRejection.rejectReasonCode, eachRejection.followupActionCode)
                                .takeUntil(this.unSubscribe).subscribe(
                                AAARejectionMessage => {
                                    this.rejectionDetails =
                                        this.utils.getRejectionDisplayMessage(AAARejectionMessage, this.rejectionDetails);
                                },
                                error => {
                                    this.alertService.error(error.error.errors[0].endUserMessage);
                                }
                            );
                        });
                    }
                    // ---- CHECK FOR AAA REJECTIONS - END ---------------------------------------------------------------------

                }
                this.loaderService.display(false);
            },
            error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            });

    }
    showHideBackToTopButton(value, selectedTabIndex) {
        if (value === 'true') {
            this.goOnTop = false;
        } else if (value === 'false') {
            this.goOnTop = true;
        }
        this.selectedTab = selectedTabIndex;
    }

    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }

    processDiagnosisCode(code) {
        let result = null;
        if (code !== null && code !== undefined && code !== '') {
             const index = code.lastIndexOf('(');
           result =  code.substring(0, index );
           const innerCode = code.substring(index, code.length);
           if (innerCode.length > 5) {
              result = result + innerCode.substring(0, 4) + '.' + innerCode.substring(4, code.length);
           }  else {
               result = result + innerCode;
           }




        }
        return result;
    }
}
