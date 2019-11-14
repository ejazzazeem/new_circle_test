import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { LoaderService, AlertService, ClaimStatusService, DataSharingService } from '@services/index';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { currencyType, currencyDisplayOption, currencySymbol } from '@misc/constant';


@Component({
    selector: 'app-claim-status-detail',
    templateUrl: './claim-status-detail.component.html',
    styleUrls: ['./claim-status-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class ClaimStatusDetailComponent implements OnInit, OnDestroy  {
    @ViewChild(DataTableDirective) dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};
    providerData: any;
    subscriberData: any;
    claimData: any;
    payerData: any;
    dependentData: any;
    transactionData: any;
    goOnTop = false;
    selectedTab: 1;
    claimStartDate: any;
    claimEndDate: any;
    claimServiceLines: any;
    providerNpi: any;
    permissions: any = [];
    permissionEnable = false;
    model: any = {};
    claimResponse = {};
    // Currency Pipe Options
    type = currencyType;
    symbol = currencySymbol;
    displayOption = currencyDisplayOption;

    private unSubscribe = new Subject();

    constructor(private claimStatusService: ClaimStatusService,
                private loaderService: LoaderService,
                private router: Router,
                private alertService: AlertService,
                private dataService: DataSharingService,
                private cdr: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.loaderService.display(true);

        this.dtOptions = {
            scrollY: '350px',
            scrollCollapse: true,
            pagingType: 'full_numbers',
            searching: false,
            info: false,
            lengthChange: false,
            ordering: true,
            paging: false,
            language: {
                emptyTable: 'No Service Lines Found'
            },
            columnDefs: [
                {
                    'targets': [1, 2, 3, 4, 5, 6, 7, 8],
                    'orderable': false,
                },
            ],
        };

        // this.claimStatusService.getClaimDetailsData().takeUntil(this.unSubscribe).subscribe( // un comment this line to get mock data
        this.dataService.getSingleResponseDetail.takeUntil(this.unSubscribe).subscribe(
            data => {
                if (Object.keys(data).length === 0) {
                    this.router.navigate(['/client/claim-status/inquiry']);
                } else {
                    // to activate the tab
                    this.showHideBackToTopButton(false, 1);
                    const response = [];
                    response.push(data);
                    this.cdr.detectChanges();
                    this.payerData = response[0].payer;
                    this.providerData = response[0].provider;
                    this.dependentData = response[0].dependent;
                    this.transactionData = response[0].transactionInfo;
                    this.subscriberData = response[0].subscriber;
                    this.providerNpi = response[0].providerNpi;

                    if (response[0].claimIndexInList) {
                        this.claimData = this.dependentData ?
                                            this.dependentData.claims[response[0].claimIndexInList] :
                                            this.subscriberData.claims[response[0].claimIndexInList];
                    } else {
                        this.claimData = this.dependentData ? this.dependentData.claims[0] : this.subscriberData.claims[0];
                    }
                    this.claimServiceLines = this.claimData.serviceLines;
                    // Claim Date Case Handled
                    if (this.claimData.serviceDates) {
                        if (this.claimData.serviceDates.includes('-')) {
                            const claimDateData = this.claimData.serviceDates.split('-');
                            this.claimStartDate = claimDateData[0];
                            this.claimEndDate = claimDateData[1];
                        } else {
                            this.claimStartDate = this.claimData.serviceDates;
                            this.claimEndDate = '';
                        }
                    }
                    if (this.claimData.serviceLines) {
                        this.claimServiceLines = this.claimData.serviceLines;
                        this.claimServiceLines.forEach(serviceObj => {
                            // service date case handled
                            if (serviceObj.serviceDates && serviceObj.serviceDates !== '') {
                                if (serviceObj.serviceDates.includes('-')) {
                                    const serviceDateData = serviceObj.serviceDates.split('-');
                                    serviceObj.serviceStartDate = serviceDateData[0];
                                    serviceObj.serviceEndDate = serviceDateData[1];
                                } else {
                                    serviceObj.serviceStartDate = serviceObj.serviceDates;
                                    serviceObj.serviceEndDate = '';
                                }
                            } else {
                                serviceObj.serviceStartDate = '';
                                serviceObj.serviceEndDate = '';
                            }
                        });
                    }
                }

                // populate data sharing service to store details page data to display on provider inquiry form
                this.dataService.getClaimFormData.take(1).subscribe(
                    response => {
                        const formData = {
                            payer: response['payer'],
                            payerProvider: response['payerProvider'],
                            subscriber: response['subscriber'],
                            claim: response['claim'],
                            recentProvider: response['recentProvider'],
                            searchParams: response['searchParams'],
                            txtQuery: response['txtQuery']
                        };

                        formData.subscriber.memberNo = this.subscriberData.memberNumber;
                        if (!this.dependentData) {
                            formData.subscriber.firstName = this.subscriberData.name.given;
                            formData.subscriber.lastName = this.subscriberData.name.family;
                        } else {
                            formData.subscriber.firstName = this.dependentData.name.given;
                            formData.subscriber.lastName = this.dependentData.name.family;
                        }
                        if (this.claimData) {
                            formData.claim.claimNumber = this.claimData.claimNumber;
                            formData.claim.patientAccountNumber = this.claimData.patientAccountNumber;
                        }

                        this.dataService.setClaimFormData(formData);
                    });

                this.loaderService.display(false);
            },
            error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            });
        this.getPermissionList();
    }

    showHideBackToTopButton(value, selectedTabIndex) {
        if (value === 'true') {
            this.goOnTop = false;
        } else if (value === 'false') {
            this.goOnTop = true;
        }
        this.selectedTab = selectedTabIndex;
    }

    /**
     * @ngdoc method
     * @name startInquiry
     * @methodOf healtheNet.ui.component: ClaimStatusDetailComponent
     * @description
     * Redirect from claim status details page to provider Inquiry
     */
    startInquiry(permission) {
        if (permission.name === 'Provider Inquiry') {
            this.router.navigate(['/client/provider-inquiry']);
        }
    }
    /**
     * @ngdoc method
     * @name getPermissionList
     * @methodOf healtheNet.ui.component: ClaimStatusDetailComponent
     * @description
     * Get the permission List from data sharing service and set them on claim status details
     * view for multiple transactions (e.g provider inquiry).
     */
    getPermissionList() {
        this.dataService.getPermissionsList.takeUntil(this.unSubscribe).subscribe(
            data => {
                if (Object.keys(data).length === 0) {
                    this.router.navigate(['/client/claim-status-inquiry']);
                } else {
                    this.model = data;
                    const permissionListToStore = [];
                    this.model.forEach(permission => {
                        if (permission.name === 'Provider Inquiry') {
                            this.permissionEnable = true;
                            permissionListToStore.push(permission);
                        }
                    });
                    this.permissions = permissionListToStore;
                }
            });
    }

    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }
}
