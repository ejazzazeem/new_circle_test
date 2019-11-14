import { Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { LoaderService, AlertService, EligibilityService, DataSharingService, SharedService } from '@services/index';
import { Router} from '@angular/router';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-eligibility-response',
    templateUrl: './eligibility-response.component.html',
    styleUrls: ['./eligibility-response.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class EligibilityResponseComponent implements OnInit, OnDestroy {

    model: any = [];
    noResponseData: any = [];
    positiveResponse: any = [];
    negativeResponse: any = [];
    noResponseDataInfo: any = [];
    showResponseCounts = false;
    totalPayers = 0;
    completedResponses = 0;
    multiResponseObject = [];
    showWaiting = false;

    // options required for the data table showing positive record
    dtOptions_positive: DataTables.Settings = {};

    // options required for the data table showing negative record
    dtOptions_rejected: DataTables.Settings = {};
    private unSubscribe = new Subject();

    constructor(private loaderService: LoaderService,
                private alertService: AlertService,
                private router: Router,
                private dataSharingService: DataSharingService,
                private sharedService: SharedService,
                private cdr: ChangeDetectorRef,
                private eligibilityService: EligibilityService) { }

    ngOnInit() {
        this.loaderService.display(true);

        // options required for the data table showing positive record
        this.dtOptions_positive = {
            scrollY: '280px',
            scrollCollapse: true,
            searching: false,
            info: false,
            lengthChange: false,
            ordering: false,
            paging: false,
            language: {
                emptyTable: 'No Positive Response Found'
            }
        };

        // options required for the data table showing negative record
        this.dtOptions_rejected = {
            scrollY: '280px',
            scrollCollapse: true,
            searching: false,
            info: false,
            lengthChange: false,
            ordering: false,
            paging: false,
            language: {
                emptyTable: 'No Rejected Response Found'
            }
        };

        // Get Subscriber or Member Information if no response occurs
        this.dataSharingService.getNoResponseFromPayerDetail
            .takeUntil(this.unSubscribe).subscribe(
            data => {

                this.noResponseData = data;
                //this.cdr.detectChanges();

            }, error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            });

  const allPayersCase = localStorage.getItem('AllPayers');
  if (allPayersCase !== null && allPayersCase !== undefined) {
      localStorage.removeItem('AllPayers');
      this.showResponseCounts = true;
      this.processMultiRequest();
  } else {
      this.displayMultipleResponse();
  }

    }

    /**
     * @ngdoc method
     * @name displayMultipleResponse
     * @methodOf healtheNet.ui.component: EligibilityResponseComponent
     * @description
     * Manipulate date to display in respective tables
     */
    displayMultipleResponse() {
        // this.eligibilityService.getEligibilityMultipleResponseData()
        // .takeUntil(this.unSubscribe).subscribe( // un comment this line to get mock data
        this.dataSharingService.getMultipleResponse
            .takeUntil(this.unSubscribe).subscribe(
            data => {
                if (Object.keys(data).length < 1) {
                    this.router.navigate(['/client/eligibility/inquiry']);
                } else {
                    this.model = data;
                   // this.cdr.detectChanges();
                    this.model.forEach(eachResponse => {
                        // If we receive an error from payer.
                     this.processResponses(eachResponse);
                    });
                    this.loaderService.display(false);
                }
            }, error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
    }

    /**
     * @ngdoc method
     * @name populateMember
     * @methodOf healtheNet.ui.component: EligibilityResponseComponent
     * @description
     * Populate the tables with appropriate member names
     */
    populateMember(memberName) {
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
     * @name populateTablesWithBenefitStatus
     * @methodOf healtheNet.ui.component: EligibilityResponseComponent
     * @description
     * Get positive and rejected responses for benefit code
     */
    populateTablesWithBenefitStatus(eachResponse, eachPlan) {

        // Prepare the Eligibility Object to be displayed on the Multiple Screen
        // and Sent to the Eligibility Inquiry Page
        const eachEligibilityResponseData = {
            transactionInfo: eachResponse.transactionInfo,
            payerAndRequestingProvider: eachResponse.payerAndRequestingProvider,
            plan: eachPlan,
            providerNpi: eachResponse.providerNpi,
            providerTaxonomy: eachResponse.providerTaxonomy,
            providerTaxID: eachResponse.providerTaxID
        };

        if (eachPlan.dependent) {
            // sort the responses according to the coverage Statuses
            switch (eachPlan.dependent.benefitPlanCoverage.coverage[0].coverageStatusCategory) {
                case '':
                    eachEligibilityResponseData.plan.benefitPlanCoverage.coverage[0].coverageStatusLabel = 'No Coverage Status Found';
                    this.negativeResponse.push(eachEligibilityResponseData);
                    break;
                case 'positive':
                    this.positiveResponse.push(eachEligibilityResponseData);
                    break;
                case 'rejected':
                    this.negativeResponse.push(eachEligibilityResponseData);
                    break;
                default:
                    break;
            }
        } else {
            // sort the responses according to the coverage Statuses
            switch (eachPlan.benefitPlanCoverage.coverage[0].coverageStatusCategory) {
                case '':

                    eachEligibilityResponseData.plan.benefitPlanCoverage.coverage[0].coverageStatusLabel = 'No Coverage Status Found';
                    this.negativeResponse.push(eachEligibilityResponseData);
                    break;
                case 'positive':
                    this.positiveResponse.push(eachEligibilityResponseData);
                    break;
                case 'rejected':
                    this.negativeResponse.push(eachEligibilityResponseData);
                    break;
                default:
                    break;
            }
        }
    }


    /**
     * @ngdoc method
     * @name navigateToDetailsPage
     * @methodOf healtheNet.ui.component: EligibilityResponseComponent
     * @description
     * Set data in observable through data sharing service and
     * navigate to eligibility response details page.
     */
    navigateToDetailsPage(response) {
        if (this.totalPayers > this.completedResponses) {
            this.showWaiting = true;
            return false;
        }
        this.showWaiting = false;
        const dataArray = [];
        // Flag to indicate that this data is sent from the multiple response page
        response.fromMultiplePage = true;
        dataArray.push(response);
        this.dataSharingService.setSingleResponseDetail(dataArray);
        this.router.navigate(['/client/eligibility/detail']);
    }

    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }

    processMultiRequest() {
        const requestObj = JSON.parse(localStorage.getItem('requestData'));
        const PayerList = JSON.parse(localStorage.getItem('PayerList'));
        localStorage.removeItem('requestData');
        localStorage.removeItem('PayerList');
        this.totalPayers = requestObj.payer.length;
        this.loaderService.display(true);
        for (let i = 0; i < requestObj.payer.length; i++) {
            const Payer = PayerList.filter(x => x.payerId === requestObj.payer[i])[0];
             if (!Payer.includeInAllList) {
                 this.totalPayers = this.totalPayers - 1;
                 if (this.totalPayers === 0) {
                     this.loaderService.display(false);
                 }
                 continue;
             }
            const Obj =  JSON.parse(JSON.stringify(requestObj));
            const array = [];
            array.push(requestObj.payer[i]);
            Obj.payer = array;
            this.eligibilityService.submitEligibilityInquiry(Obj)
                .takeUntil(this.unSubscribe).subscribe(
                response => {
                    const currentResponse = response[0];
                    this.processResponses(currentResponse) ;
                    this.completedResponses = this.completedResponses + 1;
                    if (this.completedResponses === this.totalPayers) {
                        this.showWaiting = false;
                    }
                    this.multiResponseObject.push(currentResponse);
                    this.loaderService.display(false);
                }, error => {
                    const currentPayer = PayerList.filter(x => x.payerId === requestObj.payer[i])[0];
                    const resp = {'payerName': currentPayer.name, 'endUserMessage' : error.error.errors[0].endUserMessage.toString() };
                    this.processResponses(resp);
                    this.completedResponses = this.completedResponses + 1;
                    if (this.completedResponses === this.totalPayers) {
                        this.showWaiting = false;
                    }
                    this.multiResponseObject.push(resp);
                    this.loaderService.display(false);
                    //      this.alertService.error(error.error.errors[0].endUserMessage);
                }
            );
        }
        this.dataSharingService.setMultipleResponse(this.multiResponseObject);

    }


    processResponses(eachResponse) {
        if (eachResponse['endUserMessage']) {
            this.noResponseDataInfo = [];

            // POPULATE NO RESPONSE DATA
            this.noResponseDataInfo.payerAndRequestingProvider = {
                payer: eachResponse['payerName']
            };

            this.noResponseDataInfo.plan = {
                benefitPlanCoverage: {
                    coverage: [{
                        coverageStatusLabel: eachResponse['endUserMessage'].indexOf('National Provider ID') !== -1 ?
                            'Invalid National Provider ID (NPI). Please enter a valid NPI.' : eachResponse['endUserMessage']
                    }]

                },
                member: {
                    memberName: {
                        family: this.noResponseData.subscriber.lastName,
                        given: this.noResponseData.subscriber.firstName
                    },
                    memberDoB: this.noResponseData.subscriber.dateOfBirth !== null
                        ? this.noResponseData.subscriber.dateOfBirth : ''
                }
            };

            this.negativeResponse.push(this.noResponseDataInfo);
        } else {
            const rejectionCodes = [];
            let isPayerRejection = false;

            // If Any rejection occurs. Payers or member or provider
            if (eachResponse.payerAndRequestingProvider && eachResponse.payerAndRequestingProvider.payerRejections) {
                eachResponse.payerAndRequestingProvider.payerRejections.forEach(payerRejection => {
                    rejectionCodes.push({
                        reasonCode: payerRejection.rejectReasonCode,
                        followupCode: payerRejection.followupActionCode
                    });
                });
                isPayerRejection = true;
            }

            eachResponse.plan.forEach(eachPlan => {
                let isPlanRejection = false;
                if (eachPlan.member && eachPlan.member.memberRejections) {
                    eachPlan.member.memberRejections.forEach(memberRejection => {
                        rejectionCodes.push({
                            reasonCode: memberRejection.rejectReasonCode,
                            followupCode: memberRejection.followupActionCode
                        });
                    });
                    isPlanRejection = true;
                }
                if (eachPlan.primaryCareProvider && eachPlan.primaryCareProvider.providerRejections) {
                    eachPlan.primaryCareProvider.providerRejections.forEach(providerRejection => {
                        rejectionCodes.push({
                            reasonCode: providerRejection.rejectReasonCode,
                            followupCode: providerRejection.followupActionCode
                        });
                    });
                    isPlanRejection = true;
                }

                // if rejection code is present then implement this code
                if (rejectionCodes && rejectionCodes.length !== 0 && (isPayerRejection || isPlanRejection)) {
                    eachPlan.benefitPlanCoverage.coverage[0].coverageStatusLabel = '';
                    rejectionCodes.forEach(rejectionCode => {
                        if (rejectionCode.reasonCode || rejectionCode.followupCode) {
                            let reasonCodeMessage = '';
                            let followupCodeMessage = '';

                            // Service call to fetch the reject reason code and followup code display message
                            this.sharedService
                                .getAAARejectionDisplayMessage(rejectionCode.reasonCode, rejectionCode.followupCode)
                                .takeUntil(this.unSubscribe).subscribe(
                                AAARejectionMessage => {
                                    AAARejectionMessage.forEach(eachMessage => {
                                        if (eachMessage.reasonCode) {
                                            reasonCodeMessage = eachMessage.displayMessage;
                                        }
                                        if (eachMessage.followupCode) {
                                            followupCodeMessage = eachMessage.displayMessage;
                                        }
                                    });

                                    // Prepare the Rejection display message to be populated in the table
                                    // Reason Code - Followup Code (Comma separated if more than one)
                                    if (!eachPlan.benefitPlanCoverage.coverage[0].coverageStatusLabel) {
                                        eachPlan.benefitPlanCoverage.coverage[0].coverageStatusLabel
                                            = reasonCodeMessage + ' - ' + followupCodeMessage;
                                    } else {
                                        eachPlan.benefitPlanCoverage.coverage[0].coverageStatusLabel
                                            = eachPlan.benefitPlanCoverage.coverage[0].coverageStatusLabel + ', '
                                            + reasonCodeMessage + ' - ' + followupCodeMessage;
                                    }
                                }, error => {
                                    this.alertService.error(error.error.errors[0].endUserMessage);
                                }
                            );
                        }
                    });
                    // Prepare the Eligibility Object to be displayed on the Multiple Screen
                    // Will not Sent to the Eligibility Inquiry Page so only set data that we need
                    const eachEligibilityResponseData = {
                        payerAndRequestingProvider: eachResponse.payerAndRequestingProvider,
                        plan: eachPlan
                    };
                    this.negativeResponse.push(eachEligibilityResponseData);
                } else {
                    this.populateTablesWithBenefitStatus(eachResponse, eachPlan);
                }
            });
        }
    }
}

