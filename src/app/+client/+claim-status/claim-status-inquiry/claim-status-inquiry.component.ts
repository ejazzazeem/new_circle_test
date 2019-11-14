import {
    Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit, NgZone, OnDestroy,
    ChangeDetectorRef, ChangeDetectionStrategy, HostListener
} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Subject';
import { ClaimStatusService, UserSessionService, AlertService, SharedService,
    LoaderService, UtilsService, DataSharingService, PayerDetailsService } from '@services/index';
import { Page, SortFields, DataRequest } from '@models/index';
import { Router } from '@angular/router';
import * as moment from 'moment';
import {isNullOrUndefined} from 'util';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
declare function isNumberKey(e, target): any;
declare function isValidDate(e): any;
import { DomSanitizer } from '@angular/platform-browser';
@Component({
    selector: 'app-claim-status-inquiry',
    templateUrl: './claim-status-inquiry.component.html',
    styleUrls: ['./claim-status-inquiry.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class ClaimStatusInquiryComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('submitBtn') btn: any;
    @ViewChild(DataTableDirective) dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
    model: any = {
        payer: {},
        payerProvider: {},
        subscriber: {},
        dependent: {},
        claim: {}
    };

    payerList = [];
    providerList = [];
    memberOrSubscriber: String = 'Member';
    dateMsgSubscriber: String  = null;
    dateMsgDependent: String = null;
    dateMsgClaimFrom: String = null;
    dateMsgClaimTo: String = null;
    claimTo: Date;
    maxDate: Date;
    minDate: Date;
    claimFrom: Date;
    customDateCheck: boolean;
    showBillType: boolean;
    recentProvider: boolean;
    showSubmittingCharges: boolean;
    subscriberCheck: number;
    subscriberIndex: number;
    dependentIndex: number;
    memberError: string;
    dependentError: string;
    permissionId = '';
    permissionName = 'Claims Status Inquiry';
    chargesValidation = true;
    // server side pagination
    pageSize = 100;
    currentOffset = 0;
    totalPages = 0;
    preClass = 'pre disabled';
    nextClass = 'next';
    sortIcon = 'sort-icon asc';
    keyword = '';
    totalRecords = 0;
    memberInfo = false;
    userRole: string;
    userInfo: any = {};
    searchParameters: any = {};
    inquiryData: any;
    isRequestingProvider = false;
    selectedTabIndex = 0;
    toDateCount = 0;
    showClaimError = false;
    // HNP-5432
    showProviderMessage = false;

    // autocomplete for search bill type code
    txtQuery: string;
    txtQueryChanged: Subject<string> = new Subject<string>();
    searchResult: any = [];

    private unSubscribe = new Subject();
    tableClass = 'common-datatable grid-table table-striped';
    tabClass = 'tabs-main-container';
    searchedProvider: any = {};
    practiceOfficeUserMode = false;
    adxTransactionId = '';
    validBillType = false;
    tipURL: any;
    @HostListener('document:keypress', ['$event'])
    // HNP-5431
    handleKeyboardEvent(event: any) {
        if (event.key === 'Enter' && !this.btn._disabled
            && !event.target.className.includes('common-search')) { // HNP-13465 - Do not submit on search

            const contextualRef = this;
            setTimeout(function() {
                const isCalender = document.getElementsByClassName('cdk-overlay-backdrop-showing');
                if (isCalender.length === 0) {
                    contextualRef.saveInquiry();
                }
            }, 250);
        }
    }

    constructor(private claimStatusService: ClaimStatusService,
                private userSessionService: UserSessionService,
                private alertService: AlertService,
                private loaderService: LoaderService,
                private route: Router,
                private utils: UtilsService,
                private dataService: DataSharingService,
                private sharedService: SharedService,
                private zone: NgZone,
                private payerService: PayerDetailsService,
                private cdr: ChangeDetectorRef,
                private sanitizer: DomSanitizer) {

        // debouncing on autocomplete for diagnosis code
        this.txtQueryChanged
            .debounceTime(1000) // wait 1 sec after the last event before emitting last event
            .distinctUntilChanged() // only emit if value is different from previous value
            .takeUntil(this.unSubscribe)
            .subscribe(model => {
                this.txtQuery = model;

                // Call your function which calls API or do anything you would like do after a lag of 1 sec
                this.onSearchChange(this.txtQuery);
            });
    }

    ngAfterViewInit(): void {
        this.dtTrigger.next();
        setTimeout(function () {
            const myElement = <HTMLElement>document.getElementsByClassName('ng-star-inserted highlighted')[0];
            if (myElement) {
                const topPos = myElement.offsetTop;
                document.getElementsByClassName('dataTables_scrollBody')[0].scrollTop = topPos;
            }
        } , 2500);
    }

    ngOnInit() {
        this.loaderService.display(true);
        // Get the permission List from local storage and fetch/set the specific permission Id for this page
        this.permissionId = this.utils.setPermissionIdInLocalStorage(this.permissionName);
        this.adxTransactionId = this.utils.getAdxId(this.permissionName);
        this.minDate = new Date(1900, 0, 1); // user cannot select date before 1900
        this.maxDate = new Date(); // user cannot select future date for

        // Setting the DOB
        this.model.subscriber.dateOfBirth = null;
        this.model.dependent.dateOfBirth = null;

        this.dtOptions = {
            scrollY: '280px',
            scrollCollapse: true,
            pagingType: 'full_numbers',
            searching: false,
            info: false,
            lengthChange: false,
            ordering: false,
            paging: false,
            language: {
                emptyTable: 'No Providers Found'
            }
        };

        // Temporary getting permission Id from local storage
        const currentUser = localStorage.getItem('currentUser');
        this.dataService.getFormDataFromInquiryForm.takeUntil(this.unSubscribe).subscribe(
            data => {
                this.inquiryData = data;
                if (this.inquiryData.recentProvider) {
                    this.selectedTabIndex = 1;
                }
                if (this.inquiryData.subscriber) {
                    this.model.subscriber.memberNo = this.inquiryData.subscriber.memberNo;
                    this.model.subscriber.firstName = this.inquiryData.subscriber.firstName;
                    this.model.subscriber.lastName = this.inquiryData.subscriber.lastName;
                    // this.model.dateOfBirthS = this.inquiryData.subscriber.dateOfBirth;
                    this.model.dateOfBirthS = moment(this.inquiryData.subscriber.dateOfBirth).toISOString();
                    this.model.subscriber.gender = this.inquiryData.subscriber.gender;

                } if (this.inquiryData.claim) {
                    this.model.claim.claimNumber = this.inquiryData.claim.claimNumber;
                    this.model.claim.serviceDateRange = this.inquiryData.claim.serviceDateRange;
                    this.claimFrom = this.inquiryData.claimFrom;
                    this.claimTo = this.inquiryData.claimTo;
                    this.model.claim.monetaryAmount = this.inquiryData.claim.monetaryAmount;
                    this.model.claim.billType = this.inquiryData.claim.billType;
                }
                if (this.inquiryData.dependent) {
                    this.model.dependent.firstName = this.inquiryData.dependent.firstName;
                    this.model.dependent.lastName = this.inquiryData.dependent.lastName;
                    this.model.dependent.gender = this.inquiryData.dependent.gender;
                    // this.model.dateOfBirthD = this.inquiryData.dependent.dateOfBirth;
                    this.model.dateOfBirthD = moment(this.inquiryData.dependent.dateOfBirth).toISOString();
                }
                if (this.inquiryData.txtQuery) {
                    this.txtQuery = this.inquiryData.txtQuery;
                    const index = this.txtQuery.lastIndexOf('(') + 1;
                    this.model.claim.billType = this.txtQuery.substring( index, this.txtQuery.length - 1);
                    this.validBillType = false;

                }
                if (this.inquiryData.pageInfo) {
                    this.pageSize = this.inquiryData.pageInfo.pageSize;
                    this.currentOffset = this.inquiryData.pageInfo.currentPage;
                }
            });

        if (currentUser) {
            this.userInfo = JSON.parse(currentUser);
            this.userRole = this.userInfo.role;
            if (this.userRole === 'PAYER_USER') {
                const mode = localStorage.getItem('payerMode');
                if (mode ) {
                    this.practiceOfficeUserMode = true;

                }
            }
            this.getUserPayers();
        } else {
            // Loads Information from User Session Service
            this.userSessionService.getUserSessionInfo().takeUntil(this.unSubscribe).subscribe(
                data => {
                    this.loaderService.display(true);
                    this.userInfo = data;
                    this.cdr.detectChanges();
                    this.userRole = this.userInfo.role.role;
                    if (this.userRole === 'PAYER_USER') {
                        const mode = localStorage.getItem('payerMode');
                        if (mode ) {
                            this.practiceOfficeUserMode = true;

                        }
                    }
                    this.getUserPayers();
                    this.loaderService.display(false);
                },
                error => {
                    this.loaderService.display(false);
                    this.alertService.error(error.error.errors[0].endUserMessage);
                }
            );
        }
    }

    // date validation
    handledate(e) {
        return isNumberKey(e, e.target);
    }

    // Validate DOB
    validateDOB(e) {
        return this.utils.isValid(e.target.value) ? isValidDate(e.target.value) ?
            new Date(e.target.value).getTime() < new Date('01/01/1900').getTime() ? 'Date should be greater or equals to 01/01/1900' :
                new Date(e.target.value).getTime() > new Date().getTime() ? 'Date of birth cannot be a future date' :
                    null : 'Invalid date.' : null;
    }

    // Validate from date
    validateFromDate(e) {
        this.customDateCheck = (this.claimFrom > this.claimTo);
        return this.utils.isValid(e.target.value) ? isValidDate(e.target.value) ?
            new Date(e.target.value).getTime() < new Date('01/01/1900').getTime() ? 'Date should be greater or equals to 01/01/1900' :
                new Date(e.target.value).getTime() > new Date().getTime() ? 'From date cannot be a future date' :
                    null : 'Invalid date.' : null;
    }

    // Validate to date
    validateToDate(e) {

        this.customDateCheck = (this.claimFrom > this.claimTo);
        return this.utils.isValid(e.target.value) ? isValidDate(e.target.value) ? this.utils.isValid(this.claimFrom) ?
            // new Date(e.target.value).getTime() < new Date(this.claimFrom).getTime() ? 'To date should be greater than from date' :
            new Date(e.target.value).getTime() > new Date().getTime() ? 'To date cannot be a future date' :
                null : 'Please select from date first.' : 'Invalid date.' : null;
    }

    // Automatically populate ToDate on basis of selected FromDate
    // HNP-13114
    populateToDate() {
        if (this.claimFrom && this.dateMsgClaimFrom === null && this.toDateCount === 1) {
            this.claimTo = this.claimFrom;
            this.toDateCount = 0;
        }
    }

    // Get Directly Associated Payers for Payer users
    getUserPayers() {
        let role = this.userRole;

        if (this.userRole === 'PAYER_USER' ) {
            this.tableClass = 'common-datatable grid-table table-striped servicing-Ptable';
            this.tabClass = (this.practiceOfficeUserMode) ? 'tabs-main-container' : 'tabs-main-container without-search';
        } else {
            role = 'PRACTICE_OFFICE_USER';

        }
        const id = this.userRole === 'PRACTICE_OFFICE_USER' ? this.adxTransactionId : this.permissionId;
        this.sharedService.getUserPayers(id, role).takeUntil(this.unSubscribe).subscribe(
            data => {
                this.loaderService.display(true);
                this.payerList = data;
                this.cdr.detectChanges();
                this.payerList.forEach(obj => {
                    if ( obj.payerId === this.inquiryData.payer) {
                        if (this.inquiryData.payer) {
                            this.model.userPayer = this.inquiryData.payer;
                            this.updatePayer(this.model.userPayer);
                        }
                        if (this.inquiryData.searchParams) {
                            this.searchedProvider = this.inquiryData.searchParams;
                            const ob = this.inquiryData.searchParams;
                            if (ob.postalCode) {
                                this.searchedProvider.serviceZip = ob.postalCode;
                            }
                            if (ob.state) {
                                this.searchedProvider.serviceState = ob.state;
                            }
                            if (ob.city ) {
                                this.searchedProvider.serviceCity = ob.city;
                            }
                            if (ob.address) {
                                this.searchedProvider.serviceAddressLine1 = ob.address;
                            }
                        }
                        if (this.inquiryData.payerProvider) {
                            if (this.inquiryData.recentProvider) {
                                this.checkRecent();
                                this.selectProvider(this.inquiryData.payerProvider);
                            } else if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
                                    this.filterResults(this.sortIcon);
                                    this.selectProvider(this.inquiryData.payerProvider);
                            } else {
                                    this.filterProviders();
                                    this.selectProvider(this.inquiryData.payerProvider);
                            }
                        }
                        this.getPermissionSettings();
                    }
                });
                this.loaderService.display(false);
            },
            error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
    }

    // Get payer specific settings for transaction permission
    getPermissionSettings() {
        this.sharedService.getPermissionSetting(this.model.payer.payerId, this.adxTransactionId)
            .takeUntil(this.unSubscribe).subscribe(
            data => {
                this.loaderService.display(true);
                this.cdr.detectChanges();
                data.onOffConfigs.forEach(config => {

                    if (config.configName === 'Member Information Settings') {
                        this.memberOrSubscriber = config.value === 'ACTIVE' ? 'Member' : 'Subscriber';
                    }
                    if (config.configName === 'Submitting Charges') {
                        this.showSubmittingCharges = config.value === 'ACTIVE';
                    }
                    if (config.configName === 'Bill Type') {
                        this.showBillType = config.value === 'ACTIVE';
                    }
                });
                this.loaderService.display(false);
            },
            error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
    }

    // Get Requesting Providers For Payer
    getRequestingProviders() {
        if (this.model.payer.payerId !== undefined) {

            this.loaderService.display(true);
            this.sortIcon = 'sort-icon asc';
            this.totalRecords = 0;
            this.filterResults(this.sortIcon );
            this.loaderService.display(false);
        }
    }
    // If payers are recent
    checkRecent() {
        this.model.payerProvider = null;
        this.recentProvider = !this.recentProvider;
        if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
            this.getRequestingProviders();
        } else {
            this.filterProviders();
        }
    }

    // selected payer
    updatePayer(payerId) {
        this.isRequestingProvider = true;
        this.model.payerProvider = null;
        this.showProviderMessage = false;
        this.model.payer.payerId = payerId;
        this.payerList.forEach(obj => {
            if ( obj.payerId === this.model.payer.payerId) {
                this.model.payer.name = obj.name;
            }
        });
        if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
            this.getRequestingProviders();
        }
        this.providerList.splice(0, this.providerList.length);
        if (!this.inquiryData || this.inquiryData.payer !== payerId) {
            this.searchedProvider = {};
            this.inquiryData.payerProvider = {};
            this.inquiryData.payer = {};
            this.getPermissionSettings();
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                // Destroy the table first
                dtInstance.destroy();
                this.dtTrigger.next();
            }).catch(error => {
                console.error('Error getting providers. ' + error);
            });
        }

    }

    // Selected Requesting Provider
    selectProvider(provider) {
        this.showProviderMessage = false;
        this.model.payerProvider = isNullOrUndefined(this.model.payerProvider) ? {} : this.model.payerProvider;
        this.model.payerProvider.address =
            isNullOrUndefined(this.model.payerProvider.address) ? {} : this.model.payerProvider.address;

        this.model.payerProvider.npi = provider.npi;
        this.model.payerProvider.taxId = provider.taxId;
        this.model.payerProvider.id = provider.providerId;
        this.model.payerProvider.lastName = provider.lastName;
        this.model.payerProvider.taxonomy = provider.taxonomy;
        this.model.payerProvider.firstName = this.utils.isValid(provider.firstName) ?
            provider.firstName : null;
        // Payer provider address
        this.model.payerProvider.address.city = provider.serviceCity;
        this.model.payerProvider.address.state = provider.serviceState;
        this.model.payerProvider.address.zipCode = provider.serviceZip;
        this.model.payerProvider.address.line1 = provider.serviceAddressLine1;
        this.model.payerProvider.address.line2 = provider.serviceAddressLine2;
    }

    validateForm() {

        // If payer is not selected the submit button will be disabled
        let i = 0, j = 0, z = 0;

        if (this.utils.isValid(this.model.claim.claimNumber) && this.model.claim.claimNumber.trim().length > 0 ) {
            i = i + 2;
        }
        if (this.utils.isValid(this.model.subscriber.memberNo) && this.model.subscriber.memberNo.trim().length > 0) {
            i++;
            z++;
        }
        if (this.utils.isValid(this.model.subscriber.firstName) || this.utils.isValid(this.model.subscriber.lastName) ||
            this.utils.isValid(this.model.dateOfBirthS)) {
            z++;
        }
        if (this.utils.isValid(this.claimFrom) && this.utils.isValid(this.claimTo) &&
            this.dateMsgClaimFrom === null && this.dateMsgClaimTo === null ) {
            i++;
        }
        if (this.utils.isValid(this.model.dependent.firstName) && (this.model.dependent.firstName.trim().length > 0 &&
            this.model.dependent.firstName.trim().length <= 35)) {
            j++;
        }
        if (this.utils.isValid(this.model.dependent.lastName) && (this.model.dependent.lastName.trim().length > 0 &&
            this.model.dependent.lastName.trim().length <= 60)) {
            j++;
        }
        if (this.utils.isValid(this.model.dateOfBirthD) && this.dateMsgDependent === null) {
            j++;
        }
        this.subscriberCheck = z;
        this.subscriberIndex = i;
        this.dependentIndex = j;
        this.dependentError = (this.dependentIndex < 3 && this.dependentIndex !== 0) ?
            'If specifying a dependent, please enter a valid value for at least Name(First and Last) and DOB' : '';

        if (!(this.subscriberIndex < 2)) {
            this.memberError = '';
        }
        if (this.utils.isValid(this.claimFrom) || this.utils.isValid(this.claimTo)) {
            if (!(this.utils.isValid(this.claimFrom) && this.utils.isValid(this.claimTo))) {
                return true;
            }
        }

        if ((this.utils.isValid(this.model.claim.claimNumber) && this.model.claim.claimNumber.trim().length > 0) &&
            this.utils.isValid(this.model.payer.payerId) &&
            !isNullOrUndefined(this.model.payerProvider)) {
            return !this.utils.isValid(this.model.payerProvider.id);
        }

        if (this.utils.isValid(this.model.payer.payerId) &&
            !isNullOrUndefined(this.model.payerProvider) &&
            this.utils.isValid(this.claimFrom) &&
            this.utils.isValid(this.claimTo) &&
            (this.utils.isValid(this.model.subscriber.memberNo) && this.model.subscriber.memberNo.trim().length > 0)) {
            return false;
        }
        return true;
    }

    checkSubscriber() {
        // Check Subscriber when the dependent section is started
        this.memberError = '';
        this.memberError = this.subscriberIndex < 2 ?
            'Either Claim Number or Member ID and Date Range are required' : '';
        if (isNullOrUndefined(this.model.payerProvider)) {
            this.showProviderMessage = true;
        }
    }

    saveInquiry() {
        this.loaderService.display(true);
        this.model.claim.serviceDateRange = this.utils.getClaimServiceDate(this.claimFrom, this.claimTo);
        this.model.subscriber.dateOfBirth = this.utils.isValid(this.model.dateOfBirthS) ?
            moment(this.model.dateOfBirthS).format('YYYY-MM-DD') : null;
        this.model.dependent.dateOfBirth = this.utils.isValid(this.model.dateOfBirthD) ?
            moment(this.model.dateOfBirthD).format('YYYY-MM-DD') : null;
        if ( !isNullOrUndefined(this.model.subscriber.memberNo)) {
            this.model.subscriber.memberNo = this.model.subscriber.memberNo.trim();
        }
        if ( !isNullOrUndefined(this.model.subscriber.firstName)) {
            this.model.subscriber.firstName = this.model.subscriber.firstName.trim();
        }
        if ( !isNullOrUndefined(this.model.subscriber.lastName)) {
            this.model.subscriber.lastName = this.model.subscriber.lastName.trim();
        }
        if ( !isNullOrUndefined(this.model.dependent.firstName)) {
            this.model.dependent.firstName = this.model.dependent.firstName.trim();
        }
        if ( !isNullOrUndefined(this.model.dependent.lastName)) {
            this.model.dependent.lastName = this.model.dependent.lastName.trim();
        }
        let claimStatusObject = {};
        const claimObj = {
            claimNumber: this.utils.isValid(this.model.claim.claimNumber) ? this.model.claim.claimNumber.trim() : null,
            monetaryAmount: this.utils.isValid(this.model.claim.monetaryAmount) ? this.model.claim.monetaryAmount : null,
            billType: this.utils.isValid(this.model.claim.billType) ? this.model.claim.billType : null,
            serviceDateRange: this.model.claim.serviceDateRange,
        };

        if (this.dependentIndex === 0 || this.memberOrSubscriber === 'Member') {
            claimStatusObject = (this.subscriberCheck === 0) ? {
                payer: this.model.payer,
                payerProvider: this.model.payerProvider,
                claim: claimObj,
            } : {
                payer: this.model.payer,
                payerProvider: this.model.payerProvider,
                subscriber: this.model.subscriber,
                claim: claimObj,
            };
        } else {
            claimStatusObject = (this.subscriberCheck === 0) ? {
                payer: this.model.payer,
                payerProvider: this.model.payerProvider,
                dependent: this.model.dependent,
                claim: claimObj,
            } : {
                payer: this.model.payer,
                payerProvider: this.model.payerProvider,
                subscriber: this.model.subscriber,
                dependent: this.model.dependent,
                claim: claimObj,
            };
        }

        const providerData = {
            providerId: this.model.payerProvider.id,
            npi: this.model.payerProvider.npi,
            taxId: this.model.payerProvider.taxId,
            lastName: this.model.payerProvider.lastName,
            taxonomy: this.model.payerProvider.taxonomy,
            firstName: this.model.payerProvider.firstName,
            remitCity: this.model.payerProvider.address.city,
            remitState: this.model.payerProvider.address.state,
            remitZip: this.model.payerProvider.address.zipCode,
            serviceAddressLine1: this.model.payerProvider.address.line1,
            remitAddressLine2: this.model.payerProvider.address.line2
        };
        const pageInformation =  {currentPage : this.currentOffset, pageSize: this.pageSize};
        const formData = {
            payer: this.model.payer.payerId,
            payerProvider: providerData,
            subscriber: this.model.subscriber,
            dependent: this.model.dependent,
            claim: claimObj,
            recentProvider: this.recentProvider,
            searchParams: this.searchParameters,
            claimFrom: this.claimFrom,
            claimTo: this.claimTo,
            txtQuery: this.txtQuery,
            pageInfo: pageInformation
        };
        const lastInquiry = 'claimstatusInquiry';
        localStorage.setItem('lastInquiry', lastInquiry);

        this.dataService.setClaimFormData(formData);
        // this.claimStatusService.getClaimMultipleResponseData().takeUntil(this.unSubscribe).subscribe(
        this.claimStatusService.submitClaimStatusInquiry(claimStatusObject).takeUntil(this.unSubscribe).subscribe(
            data => {
                this.dataService.setFormDataFromInquiryForm(formData);
                if ((data.dependent && data.dependent.claims.length === 1) ||
                    (data.subscriber.claims && data.subscriber.claims.length === 1 && !data.dependent)) {
                    const dataArray = data;
                    this.dataService.setSingleResponseDetail(dataArray);
                    this.route.navigate(['/client/claim-status/detail']);
                } else {
                    this.navigateToMultipleResponsePage(data);
                }
            }, error => {
                this.loaderService.display(false);
                if (error.error.errors[0].endUserMessage.indexOf('National Provider ID') !== -1) {
                    this.alertService.error('Invalid National Provider ID (NPI). Please enter a valid NPI.');
                } else {
                    this.alertService.error(error.error.errors[0].endUserMessage);
                }

            }
        );
    }

    navigateToMultipleResponsePage(multipleData) {
        this.dataService.setMultipleResponse(multipleData);
        this.route.navigate(['/client/claim-status/multi-response']);
    }

    // HNP-5432
    verifyProvider() {
        if (isNullOrUndefined(this.model.payerProvider)) {
            this.showProviderMessage = true;
        }

    }

    onChange(date) {
        if (date === null) {
            this.claimTo = null;
        }
    }

    // Validation for submitted charges
    validateCharges(event) {
        const value = event.target.value;
        if (value.indexOf('.') === -1) {
            this.chargesValidation = !(value.length > 8);
        } else {
            const arr = value.split('.');
            if (arr[0].toString().length > 8) {
                this.chargesValidation = false;
            } else {
                this.chargesValidation = !(arr[1].toString().length !== 2);
            }

        }
    }
    // Pagination Code starts
    updatePageSize(event) {
        this.pageSize = event.value;
        this.currentOffset = 0;
        if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
            this.filterResults(this.sortIcon);
        } else {
            this.filterProviders();
        }
    }

    nextPage(cls) {
        if (cls === 'next disabled') {
            return false;
        }
        this.model.payerProvider = null;
        this.currentOffset = this.currentOffset + 1;
        if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
            this.filterResults(this.sortIcon);
        } else {
            this.filterProviders();
        }
    }

    prevPage(cls) {
        if (cls === 'pre disabled') {
            return false;
        }
        this.model.payerProvider = null;
        this.currentOffset = this.currentOffset - 1;
        if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
            this.filterResults(this.sortIcon);
        } else {
            this.filterProviders();
        }
    }


    filterResults(icon) {
        this.loaderService.display(true);
        if (icon === 'sort-icon asc') {
            this.sortIcon = 'sort-icon dec';
        } else {
            this.sortIcon = 'sort-icon asc';
        }
        const sortFields: SortFields  = {
            fieldName: 'lastName',
            sortOrder:  'ASC'
        };
        const page: Page = {
            offSet : this.currentOffset,
            size : this.pageSize
        };
        const groupRequest: DataRequest = {
            keyword : this.keyword,
            sortField : {
                page : page,
                sortField: sortFields
            }
        };

        this.sharedService.getRequestingProviders(this.model.payer.payerId, this.recentProvider, groupRequest)
            .takeUntil(this.unSubscribe).subscribe(
            data => {
                this.providerList = data.results;
                this.totalRecords =  data.totalCount;
                if ( this.totalRecords % this.pageSize === 0 ) {
                    this.totalPages =  this.totalRecords / this.pageSize ;
                } else {
                    this.totalPages = Math.floor(  this.totalRecords / this.pageSize) + 1;
                }

                this.nextClass =
                    ((this.totalPages === (this.currentOffset + 1)) || this.totalPages === 0) ? 'next disabled' : 'next';
                this.preClass = (this.currentOffset === 0) ? 'pre disabled' : 'pre';

                this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                    // Destroy the table first
                    dtInstance.destroy();
                    this.dtTrigger.next();
                }).catch(error => {
                    console.error('Error getting providers. ' + error);
                });
                this.loaderService.display(false);
            },
            error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
    }

    searchProviders(event) {
        this.model.payerProvider = null;
        if (event.target.value.length > 0 ) {
            if (event.key.toLowerCase() === 'enter') {
                this.keyword = event.target.value;
                this.filterResults(this.sortIcon);
            }

        } else {
            this.keyword = '';
            this.filterResults(this.sortIcon);
        }
    }
    // Search provider by button
    searchProvidersByClick() {
        if (this.keyword !== '') {
            this.model.payerProvider = null;
            this.filterResults(this.sortIcon);
        }
    }

    // Pagination Code Ends  -------------------------------------

    searchProvidersByPayer(event) {
        if (event.keyCode === 13 || event.target.value === '') {
            this.model.payerProvider = null;
            this.filterProviders();
        }
    }

    filterProviders() {
        this.loaderService.display(true);

        const sortFields: SortFields  = {
            fieldName: 'lastName',
            sortOrder: 'ASC'
        };
        const page: Page = {
            offSet : this.currentOffset,
            size : this.pageSize
        };
        const findParameter: DataRequest = {
            keyword : '',
            sortField : {
                page : page,
                sortField: sortFields
            }
        };

        const requestingProvider: any =  {
            'providerId': this.searchedProvider.providerId,
            'firstName': this.searchedProvider.firstName,
            'lastName': this.searchedProvider.lastName,
            'specialty': this.searchedProvider.specialty1,
            'taxId': this.searchedProvider.taxId,
            'npi': this.searchedProvider.npi,
            'address': this.searchedProvider.serviceAddressLine1,
            'city': this.searchedProvider.serviceCity,
            'state': this.searchedProvider.serviceState,
            'postalCode': this.searchedProvider.serviceZip,
            'taxonomy': this.searchedProvider.taxonomy,
        };
        this.searchParameters = requestingProvider;
        const requestObj: any = {'findParameter': findParameter , 'provider': requestingProvider  };

        this.payerService.getRequestingProviders(this.model.payer.payerId, this.recentProvider, requestObj)
            .takeUntil(this.unSubscribe).subscribe(
            data => {
                this.providerList = data.results;
                this.totalRecords =  data.totalCount;
                if ( this.totalRecords % this.pageSize === 0 ) {
                    this.totalPages =  this.totalRecords / this.pageSize ;
                } else {
                    this.totalPages = Math.floor(  this.totalRecords / this.pageSize) + 1;
                }

                this.nextClass = (this.totalPages === (this.currentOffset + 1)) ? 'next disabled' : 'next';
                this.preClass = (this.currentOffset === 0) ? 'pre disabled' : 'pre';
                if (this.totalPages === 0) {
                    this.nextClass = 'next disabled';
                }
                this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                    // Destroy the table first
                    dtInstance.destroy();
                    this.dtTrigger.next();
                }).catch(error => {
                    console.error('Error getting providers. ' + error);
                });
                this.loaderService.display(false);
            },
            error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
    }

    // triggers next on key press
    onFieldChange(query: string) {
        this.validBillType = (this.model.claim.billType === null || this.model.claim.billType === undefined);
        this.txtQueryChanged.next(query);
    }

    // search for ICD-10 code
    onSearchChange(searchValue: string) {
        if (searchValue === '') {
            this.validBillType = false;
        }

        if (searchValue !== '' && searchValue.length > 2) {
            this.claimStatusService.search_word(searchValue).takeUntil(this.unSubscribe).subscribe(response => {
                this.searchResult = response;
            });
        } else {
            this.searchResult = null;
           // this.validBillType = false;
        }

    }
    setValueItem(item) {

        return item.description +  ' (' + item.code + ')';
    }
    // get billtype value
    updateBillType(event) {
        const index = event.option.value.lastIndexOf('(') + 1;
        this.model.claim.billType = event.option.value.substring( index, event.option.value.length - 1);
        this.validBillType = false;
    }

    validateClaimNo() {
        const claim = this.model.claim.claimNumber;
        const isClaimNo = (claim === null || claim === undefined || claim === '');
        const isDateRange = isNullOrUndefined(this.claimTo) && isNullOrUndefined(this.claimFrom);

        this.showClaimError = isClaimNo && isDateRange;
    }

    verifyClaimError(e) {
        const isDateRange = isNullOrUndefined(this.claimTo) && isNullOrUndefined(this.claimFrom);
        this.showClaimError = !((!isDateRange && this.model.subscriber.memberNo && this.model.subscriber.memberNo.length > 0)
            || (this.model.claim.claimNumber && this.model.claim.claimNumber.length > 0));
    }

    verifyError(e) {
        const isDateRange = isNullOrUndefined(this.claimTo) && isNullOrUndefined(this.claimFrom);
        if (e.target.value.length > 0 && this.showClaimError) {
            this.showClaimError = false;
        } else if (e.target.value.length === 0 && isDateRange) {
            this.showClaimError = true;
        }
    }

    navigateToTip() {
        this.tipURL = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI('http://wnyhealthenet.com/wp-content/uploads/2018/10/Tip-Sheet-Claim-Status.pdf'));
        window.open( this.tipURL.changingThisBreaksApplicationSecurity );
    }
    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }
}
