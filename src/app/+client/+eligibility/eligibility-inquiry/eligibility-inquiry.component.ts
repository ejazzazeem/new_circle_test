import {
    Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit, OnDestroy,
    ChangeDetectorRef, ChangeDetectionStrategy, HostListener
} from '@angular/core';
import { AlertService, LoaderService, DataSharingService, SharedService,
    EligibilityService, UserSessionService, UtilsService, PayerDetailsService } from '@services/index';
import { SubscriberModel, DependentModel, ServiceTypeModel, Page, SortFields, DataRequest } from '@models/index';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Rx';
declare function isNumberKey(e, target): any;
declare function isValidDate(e): any;
declare function isSSN(e, target): any;
import { DomSanitizer } from '@angular/platform-browser';
import {isNullOrUndefined} from 'util';
@Component({
    selector: 'app-eligibility-inquiry',
    templateUrl: './eligibility-inquiry.component.html',
    styleUrls: ['./eligibility-inquiry.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class EligibilityInquiryComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('submitBtn') btn: any;
    @ViewChild(DataTableDirective) dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();


    serviceArray = [];
    sortedServiceArray = [];
    model: any = {
        services: []
    };
    searchParameters: any = {};
    userInfo: any = {};
    userRole: string;
    payerOrGroup = '';
    payerList = [];
    providerList = [];
    payerSettings: any;
    payerConfigs = [];
    notInList = false;
    memberOrSubscriber = 'Member';
    selectedPayer = '';
    selectedProviderId = '';
    recentProvider = false;
    isRequestingProvider = false;
    serviceLimit1 = false;
    payerId = '';
    permissionId = '';
    permissionName = 'Eligibility Inquiry';
    payerObject: any;
    multiPayerObject = [];
    providerObject = {};
    maxDate: any;
    minDate: any;
    dateErrSubscriber = false;
    dateErrDependent = false;
    dateErrEligibility = false;
    dateMsgSubscriber = '';
    dateMsgDependent = '';
    dateMsgEligibility = '';
    memberError: string;
    dependentError: string;
    eligibilityDate: any;
    addressArr = {};
    subscriberIndex: number;
    dependentIndex: number;
    permissionList = [];
    selectedGroup = '';
    // server side pagination
    pageSize = 100;
    currentOffset = 0;
    totalPages = 0;
    preClass = 'pre disabled';
    nextClass = 'next';
    sortIcon = 'sort-icon asc';
    keyword = '';
    singleProviderSearch = false;
    totalRecords = 0;
    enableAllPayers = false;
    // HNP-5432
    showProviderMessage = false;

    private unSubscribe = new Subject();
    eligibilityFormData = [];
    systemTypeCode = '';
    providerData: any;

    tableClass = 'common-datatable grid-table table-striped';
    tabClass = 'tabs-main-container';
    searchedProvider: any = {};
    practiceOfficeUserMode = false;
    adxTransactionId = '';
    selectedTabIndex = 0;
    selectedPayerName = '';
    medicaidNpi = '';
    medicaidMemberNo = '';
    selectedAddress = '';
    medicaidPayerName = '';
     tipURL: any;
    // HNP-5431
    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event) {
        if (event.key === 'Enter' && !this.btn._disabled
            && !event.target.className.includes('common-search')) { // HNP-13465 - Do not submit on search
            const contextualRef = this;
            setTimeout(function() {
                const isCalender = document.getElementsByClassName('cdk-overlay-backdrop-showing');
                if (isCalender.length === 0) {
                    if (contextualRef.selectedPayerName !== contextualRef.medicaidPayerName) {
                        contextualRef.saveInquiry();
                    } else {
                        contextualRef.saveMedicaidInquiry();
                    }
                }
            }, 250);
        }
    }

    constructor(private eligibilityService: EligibilityService,
                private userSessionService: UserSessionService,
                private alertService: AlertService,
                private loaderService: LoaderService,
                private route: Router,
                private utils: UtilsService,
                private dataSharingService: DataSharingService,
                private sharedService: SharedService,
                private payerService: PayerDetailsService,
                private cdr: ChangeDetectorRef,
                private sanitizer: DomSanitizer) { }

    ngOnInit() {
        this.loaderService.display(true);

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

        // Get Service Type Codes
        this.eligibilityService.getMedicaidPayerName().takeUntil(this.unSubscribe).subscribe(
            data => {
                this.medicaidPayerName = data.value;
            },
            error => {
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );

        // Get the permission List from local storage and fetch/set the specific permission Id for this page
        this.permissionId = this.utils.setPermissionIdInLocalStorage(this.permissionName);
        this.adxTransactionId = this.utils.getAdxId(this.permissionName);

        this.minDate = new Date(1900, 0, 1); // user cannot select date before 1900
        this.maxDate = new Date(); // user cannot select future date for DOB

        // Setting the current date on Eligibility date
        this.model.eligibilityDate = new Date();
        this.model.dateOfBirth = null;
        this.model.dateOfBirthDependent = null;

        // Temporary getting permission Id from local storage
        const currentUser = localStorage.getItem('currentUser');

        if (currentUser) {
            this.userInfo = JSON.parse(currentUser);
            this.userRole = this.userInfo.role;
            if (this.userRole === 'PAYER_USER') {
                const mode = localStorage.getItem('payerMode');
                if (mode ) {
                    this.practiceOfficeUserMode = true;

                }
            }
            this.setPayersInDropDown();
        } else {
            // Loads Information from User Session Service
            this.userSessionService.getUserSessionInfo().takeUntil(this.unSubscribe).subscribe(
                data => {
                    this.loaderService.display(true);
                    this.userInfo = data;
                   // this.cdr.markForCheck();
                   // this.cdr.detectChanges();

                    this.userRole = this.userInfo.role.role;
                    const mode = localStorage.getItem('payerMode');
                    if (mode ) {
                        this.practiceOfficeUserMode = true;

                    }
                    this.setPayersInDropDown();
                    this.loaderService.display(false);
                },
                error => {
                    this.loaderService.display(false);
                    this.alertService.error(error.error.errors[0].endUserMessage);
                }
            );
        }
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

    setPayersInDropDown() {
        // Get Service Type Codes
        this.eligibilityService.getServiceCodes().takeUntil(this.unSubscribe).subscribe(
            data => {
                this.loaderService.display(true);
                this.serviceArray = data;
               // this.cdr.markForCheck();
                // this.cdr.detectChanges();

                // Sorting the Array, pushing general benefit on top
                for (let i = 0; i < this.serviceArray.length; i++) {
                    this.sortedServiceArray[ i + 1 ] = this.serviceArray[i];
                    if (this.serviceArray[i].benefitName === 'General Benefits') {
                        this.sortedServiceArray[0] = this.serviceArray[i];
                    }
                }
                this.loaderService.display(false);
            },
            error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
        this.getUserPayers();


    }

    /**
     * @ngdoc method
     * @name populateFormData
     * @methodOf healtheNet.ui.component: EligibilityInquiryComponent
     * @description
     * Manipulate Form data if the form is returned to from the response pages through browser back button
     */
    populateFormData() {
        this.loaderService.display(true);

        if (this.route.url === '/client/eligibility/inquiry') {
            const data = JSON.parse(localStorage.getItem('eligibilityFormData'));
            // Get Eligibility Form Data to populate on browser back click
         if (data) {
             this.searchParameters = data['searchParams'];

             // this.cdr.markForCheck();
             // this.cdr.detectChanges();
             if (Object.keys(data).length !== 0 && data['eligibilityFormData']) {
                 this.eligibilityFormData.push(data['eligibilityFormData']);
                 this.systemTypeCode = data['serviceCode'];
                 this.model.userPayer = (data['payerType'] === 'AllPayers') ? '-1' : this.eligibilityFormData[0].payer[0];
                 this.updatePayer(this.model.userPayer);
                 if (data['pageInfo']) {
                    this.pageSize = data['pageInfo'].pageSize;
                    this.currentOffset = data['pageInfo'].currentPage;
                 }
                 if (data['searchParams']) {
                   const ob = data['searchParams'];
                     this.searchedProvider = data['searchParams'];
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
                 // if (data['recentProvider']) {
                 //     this.selectedTabIndex = 1;
                 //     this.recentProvider = true;
                 // }

                 if (this.eligibilityFormData[0].payerProvider) {
                     this.providerObject = this.eligibilityFormData[0].payerProvider;
                     this.providerData = data['payerProvider'];
                     if (this.selectedPayerName !== this.medicaidPayerName) {
                         if (data['recentProvider']) {
                            // this.recentProvider = true;
                             this.selectedTabIndex = 1;
                            // this.checkRecent();
                             this.selectProvider(this.eligibilityFormData[0].payerProvider.id,
                                 this.eligibilityFormData[0].payerProvider.address.line1);
                         } else if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
                             this.filterResults(this.sortIcon, data['singleProviderSearch']);
                             this.selectProvider(this.eligibilityFormData[0].payerProvider.id,
                                 this.eligibilityFormData[0].payerProvider.address.line1);
                         } else {
                             this.filterProviders();
                             this.selectProvider(this.eligibilityFormData[0].payerProvider.id,
                                 this.eligibilityFormData[0].payerProvider.address.line1);
                         }
                     }
                 } else {
                     this.providerNot();
                     if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
                         this.filterResults(this.sortIcon, data['singleProviderSearch']);
                     } else {
                         this.filterProviders();
                     }
                     // this.notInList = true;
                 }
                 if (this.eligibilityFormData[0].subscriber) {
                     this.model.member = this.eligibilityFormData[0].subscriber.memberNo;
                     this.model.firstName = this.eligibilityFormData[0].subscriber.firstName;
                     this.model.lastName = this.eligibilityFormData[0].subscriber.lastName;
                     this.model.dateOfBirth = moment(this.eligibilityFormData[0].subscriber.dateOfBirth).toISOString();
                     this.model.ssn = this.eligibilityFormData[0].subscriber.ssn;
                     this.model.gender = this.eligibilityFormData[0].subscriber.gender;
                     this.medicaidMemberNo = this.eligibilityFormData[0].subscriber.memberNo;
                     if (this.eligibilityFormData[0].payerProvider) {
                         this.medicaidNpi = this.eligibilityFormData[0].payerProvider.npi;
                     }
                 }

                 if (this.eligibilityFormData[0].dependent) {
                     this.model.firstNameDependent = this.eligibilityFormData[0].dependent.firstName;
                     this.model.lastNameDependent = this.eligibilityFormData[0].dependent.lastName;
                     this.model.dateOfBirthDependent = moment(this.eligibilityFormData[0].dependent.dateOfBirth).toISOString();
                     this.model.genderDependent = this.eligibilityFormData[0].dependent.gender;
                 }
                 this.model.eligibilityDate = moment(this.eligibilityFormData[0].service.eligibilityDate).toISOString();
                 this.dateErrEligibility = false;
                 if (this.eligibilityFormData[0].service.serviceTypeCode.length >= 1) {
                     this.model.services = this.eligibilityFormData[0].service.serviceTypeCode;
                 }

             } else {
                 // Setting the current date on Eligibility date
                 this.model.eligibilityDate = new Date();
                 this.model.dateOfBirth = null;
                 this.model.dateOfBirthDependent = null;
             }

             this.loaderService.display(false);
         }
        }
    }

    // date validation
    handledate(e) {
        return isNumberKey(e, e.target);
    }

    // Validate Subscriber DOB
    validateDateS(e) {
        if (this.payerConfigs.length > 0) {
            const config = this.payerConfigs.filter(x => x.configName === 'Requesting Provider')[0];
            if (config !== null && config.value === 'ACTIVE') {
                if (this.selectedProviderId === '' && this.notInList === false) {
                    this.showProviderMessage = true;
                }
            }
        }
        if (e.target.value === '' || e.target.value === null || e.target.value === undefined) {
            return ;
        }
        this.dateErrSubscriber = false;
        if (isValidDate(e.target.value)) {
            const d = new Date(e.target.value);
            const minDate = new Date('01/01/1900');
            if (d.getTime() < minDate.getTime()) {
                this.dateErrSubscriber = true;
                this.dateMsgSubscriber = 'Date should be greater or equals to 01/01/1900';
            } else if (d.getTime() > new Date().getTime()) {
                this.dateErrSubscriber = true;
                this.dateMsgSubscriber = 'Date of birth cannot be a future date';
            } else {
                this.dateErrSubscriber = false;
            }
        } else {
            this.dateErrSubscriber = true;
            this.dateMsgSubscriber = 'Invalid date.';
        }
    }
// Validate Dependent DOB
    validateDateD(e) {
        this.dateErrDependent = false;
        if (e.target.value === '' || e.target.value === null || e.target.value === undefined) {
            return ;
        }
        if (isValidDate(e.target.value)) {
            const d = new Date(e.target.value);
            const minDate = new Date('01/01/1900');
            if (d.getTime() < minDate.getTime()) {
                this.dateErrDependent = true;
                this.dateMsgDependent = 'Date should be greater or equals to 01/01/1900';
            } else if (d.getTime() > new Date().getTime()) {
                this.dateErrDependent = true;
                this.dateMsgDependent = 'Date of birth cannot be a future date';
            } else {
                this.dateErrDependent = false;
            }
        } else {
            this.dateErrDependent = true;
            this.dateMsgDependent = 'Invalid date.';
        }
    }
// Validate Eligibility Date
    validateDateEligibility(e) {
        this.dateErrEligibility = false;
        if (e.target.value === '' || e.target.value === null || e.target.value === undefined) {
            return ;
        }
        if (isValidDate(e.target.value)) {
            const d = new Date(e.target.value);
            const minDate = new Date('01/01/1900');
            if (d.getTime() < minDate.getTime()) {
                this.dateErrEligibility = true;
                this.dateMsgEligibility = 'Date should be greater or equals to 01/01/1900';
            } else {
                this.dateErrEligibility = false;
            }
        } else {
            this.dateErrEligibility = true;
            this.dateMsgEligibility = 'Invalid date.';
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

        this.sharedService.getUserPayers(id, role)
            .takeUntil(this.unSubscribe).subscribe(
            data => {
                this.loaderService.display(true);
             //   this.cdr.markForCheck();
              //  this.cdr.detectChanges();
                this.payerList = data;
                for (let i = 0; i < this.payerList.length; i++) {
                    this.payerList[i].displayName =
                        this.payerList[i].name !== this.medicaidPayerName ? this.payerList[i].name : 'NY MEDICAID';
                }
                if (this.payerList.length !== 0) {
                    this.enableAllPayers = true;
                }

                this.populateFormData();

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
        this.sharedService.getPermissionSetting(this.selectedPayer, this.adxTransactionId)
            .takeUntil(this.unSubscribe).subscribe(
            data => {
                this.loaderService.display(true);
                this.payerConfigs = [];
                this.payerSettings = data;
              //  this.cdr.markForCheck();
              //  this.cdr.detectChanges();
                this.payerSettings.onOffConfigs.forEach(obj => {
                    this.payerConfigs.push(obj);
                });
                for (let i = 0; i < this.payerConfigs.length; i++) {
                    if (this.payerConfigs[i].configName === 'Member Information Settings') {
                        this.memberOrSubscriber = this.payerConfigs[i].value === 'ACTIVE' ? 'Member' : 'Subscriber';
                    }
                    if (this.payerConfigs[i].configName === 'Requesting Provider') {
                        this.model.isRequestingProvider = this.payerConfigs[i].value === 'ACTIVE';
                    }
                    if (this.payerConfigs[i].configName === 'Limit Service line inout to 1') {
                        this.serviceLimit1 = this.payerConfigs[i].value === 'ACTIVE';
                    }
                }

                if (this.eligibilityFormData.length !== 0) {
                    // set service Code if type is single select
                    if (this.serviceLimit1 === true) {
                        this.model.services = (Array.isArray(this.systemTypeCode)) ? this.systemTypeCode[0] : this.systemTypeCode;
                    }
                } else {
                    // Default value for service type code
                    if (this.selectedPayerName !== this.medicaidPayerName) {
                        this.model.services = (this.serviceLimit1 === true)
                            ? this.sortedServiceArray[0].systemCode : [ this.sortedServiceArray[0].systemCode ];
                    } else {
                        this.model.services = (this.serviceLimit1 === true)
                            ? this.sortedServiceArray[62].systemCode : [ this.sortedServiceArray[62].systemCode ];
                    }

                }

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
        this.loaderService.display(true);
        if (this.selectedPayer !== undefined) {
            this.singleProviderSearch = true;
            this.sortIcon = 'sort-icon asc';
            this.totalRecords = 0;
            this.filterResults(this.sortIcon, this.singleProviderSearch );
        }

    }

    // Get Requesting Providers For All Payers
    getRequestingProvidersAllPAyers() {
        this.loaderService.display(true);
        this.singleProviderSearch = false;
        this.sortIcon = 'sort-icon asc';
        this.totalRecords = 0;
        this.filterResults(this.sortIcon, this.singleProviderSearch);
    }

    // If payers are recent
    checkRecent() {
        this.selectedProviderId = '';
        this.recentProvider = !this.recentProvider;

            if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
                this.selectedPayer === '-1' ? this.getRequestingProvidersAllPAyers() : this.getRequestingProviders();
            } else {
                this.filterProviders();
            }
    }

    // selected payer
    updatePayer(payerId) {
        this.loaderService.display(true);
        this.showProviderMessage = false;
        this.notInList = false;
        this.selectedProviderId = '';
        this.selectedPayer = payerId;
        // If User navigates back to the eligibility form
        // On changing the payer, value of Service field should be remembered
        if (this.eligibilityFormData.length > 0) {
            this.model.services = this.eligibilityFormData[0].service.serviceTypeCode;
        }
        // If All payers option is selected
        if (this.selectedPayer === '-1') {
            this.memberOrSubscriber = 'Member';
            this.model.isRequestingProvider = true;
            this.serviceLimit1 = false;
            this.selectedPayerName = '';
            if (this.sortedServiceArray.length > 0) {
                this.model.services = [ this.sortedServiceArray[0].systemCode ];
            }
            if (this.eligibilityFormData.length > 0) {
                this.model.services = this.eligibilityFormData[0].service.serviceTypeCode;
            }
           if (this.eligibilityFormData.length === 0) {
               if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
                   this.getRequestingProvidersAllPAyers();
               }
           }

            this.loaderService.display(false);
        } else {
            const filteredPayers = this.payerList.filter( x => x.payerId === this.selectedPayer);
            if (filteredPayers.length > 0) {
                this.selectedPayerName = filteredPayers[0].name;

            }
            this.payerObject = [ this.selectedPayer ];
            this.serviceLimit1 = true;
            this.getPermissionSettings();
            if (this.eligibilityFormData.length === 0) {
                if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
                    this.getRequestingProviders();
                }
            }
            this.loaderService.display(false);
        }
        this.providerList.splice(0, this.providerList.length);
        this.searchedProvider = {};
        if (this.eligibilityFormData.length === 0) {
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                // Destroy the table first
                dtInstance.destroy();
                this.dtTrigger.next();
            }).catch(error => {
                error('Error getting providers. ' + error);
            });
        }
    }

    // Selected Requesting Provider
    selectProvider(selectedPro, selectedAddress) {

        this.notInList = false;
        this.selectedProviderId =  selectedPro;
        this.selectedAddress =  selectedAddress ;

        for (let i = 0; i < this.providerList.length; i++) {
            if (this.providerList[i].providerId === this.selectedProviderId) {
                this.addressArr = {
                    line1: this.providerList[i].serviceAddressLine1,
                    line2: this.providerList[i].serviceAddressLine2,
                    city: this.providerList[i].serviceCity,
                    state: this.providerList[i].serviceState,
                    zipCode: this.providerList[i].serviceZip,
                };
                this.providerObject = {
                    id: this.providerList[i].providerId,
                    firstName: this.utils.isValid(this.providerList[i].firstName) ? this.providerList[i].firstName : null,
                    lastName: this.providerList[i].lastName,
                    address: this.addressArr,
                    npi: this.providerList[i].npi,
                    taxId: this.providerList[i].taxId,
                    taxonomy: this.providerList[i].taxonomy,
                };
                this.providerData = {
                    providerId: this.providerList[i].providerId,
                    firstName: this.providerList[i].firstName,
                    lastName: this.providerList[i].lastName,
                    serviceAddressLine1: this.providerList[i].serviceAddressLine1,
                    address: this.addressArr,
                    npi: this.providerList[i].npi,
                    taxId: this.providerList[i].taxId,
                    taxonomy: this.providerList[i].taxonomy,
                };
                this.showProviderMessage = false;
                break;
            }
        }

    }

    // Provider Not in List
    providerNot() {
        this.notInList = !this.notInList;
        this.selectedProviderId = '';
        this.providerObject = {};
        this.providerData = {};
        this.showProviderMessage = false;
    }


    validateForm() {
        // If payer is not selected the submit button will be disabled
        // While specifying a dependent at least Name(First and Last) and DOB need to be filled
        let i = 0, j = 0;
        if (this.utils.isValid(this.model.member) && this.model.member.trim().length > 0) {
            i++;
        }

        if (this.utils.isValid(this.model.firstName) && this.utils.isValid(this.model.lastName) &&
            (this.model.firstName.trim().length > 0 && this.model.lastName.trim().length > 0)) {
            i++;
        }
        if (this.utils.isValid(this.model.dateOfBirth) && this.dateErrSubscriber === false) {
            i++;
        }
        if (this.utils.isValid(this.model.ssn)) {
            i++;
        }
        if (this.utils.isValid(this.model.firstNameDependent) && (this.model.firstNameDependent.trim().length > 0 &&
            this.model.firstNameDependent.trim().length <= 35)) {
            j++;
        }
        if (this.utils.isValid(this.model.lastNameDependent) && (this.model.lastNameDependent.trim().length > 0 &&
            this.model.lastNameDependent.trim().length <= 60)) {
            j++;
        }
        if (this.utils.isValid(this.model.dateOfBirthDependent) && this.dateErrDependent === false) {
            j++;
        }
        this.subscriberIndex = i;
        this.dependentIndex = j;
        this.dependentError = (this.dependentIndex < 3 && this.dependentIndex !== 0) ?
            'If specifying a dependent, please enter a valid value for at least Name(First and Last) and DOB' : '';

        if (!(this.subscriberIndex < 2)) {
            this.memberError = '';
        }
        if (this.model.userPayer !== undefined && this.subscriberIndex >= 2 && this.model.services.length > 0
            && (this.model.eligibilityDate !== null) &&
            (this.dependentIndex === 0 || (this.dependentIndex > 0 && this.dependentIndex === 3))) {
            if (!this.model.isRequestingProvider) {
                return false;
            } else {
                return !(this.selectedProviderId !== '' || this.notInList === true);
            }
        } else {
            return true;
        }
    }

    checkSubscriber() {
        // Check Subscriber when the dependent section is started
        this.memberError = '';
        this.memberError = this.subscriberIndex < 2 ?
            'Please enter at least 2 of the following: Member #, Name(First and Last), DOB, or SSN' : '';
    }

    saveInquiry() {
        // At least Two of the form fields from subscriber should be filled
        // while specifying dependent at least name & DOB should be filled
        this.loaderService.display(true);

        const subscriberObject: SubscriberModel = {} as SubscriberModel;
      if (this.utils.isValid(this.model.member)) {
        subscriberObject.memberNo = this.model.member.trim();
       }
        if (this.utils.isValid(this.model.firstName)) {
            subscriberObject.firstName = this.model.firstName.trim().length > 0 ? this.model.firstName.trim() : '';
        } else {
            subscriberObject.firstName = '';
        }
        if (this.utils.isValid(this.model.lastName)) {
            subscriberObject.lastName = this.model.lastName.trim().length > 0 ? this.model.lastName.trim() : ' ';
        } else {
            subscriberObject.lastName = '';
        }
        if (this.model.dateOfBirth) {
            subscriberObject.dateOfBirth = moment(this.model.dateOfBirth).format('YYYY-MM-DD');
        } else {
            subscriberObject.dateOfBirth = null;
        }
        subscriberObject.ssn = this.model.ssn;
        subscriberObject.gender = this.model.gender;

        const dependentObject: DependentModel = {} as DependentModel;
        dependentObject.firstName = !isNullOrUndefined(this.model.firstNameDependent) ? this.model.firstNameDependent.trim() : this.model.firstNameDependent ;
        dependentObject.lastName = !isNullOrUndefined(this.model.lastNameDependent) ? this.model.lastNameDependent.trim() : this.model.lastNameDependent;
        if (this.model.dateOfBirthDependent) {
            dependentObject.dateOfBirth = moment(this.model.dateOfBirthDependent).format('YYYY-MM-DD');
        } else {
            dependentObject.dateOfBirth = null;
        }

        dependentObject.gender = this.model.genderDependent;

        const serviceTypeObject: ServiceTypeModel = {} as ServiceTypeModel;
        const arr:  any = [];
        serviceTypeObject.eligibilityDate = moment(this.model.eligibilityDate).format('YYYY-MM-DD');
        if (this.serviceLimit1) {
            arr.push(this.model.services);
            serviceTypeObject.serviceTypeCode = arr;
        } else {
            serviceTypeObject.serviceTypeCode = this.model.services;
        }

        let eligibilityObject = { };

        if (this.selectedPayer === '-1') {
            this.payerList.forEach(obj => {
                this.multiPayerObject.push(obj.payerId);
            });
        }

        // If requesting provider is disabled or provider is not in list, update the eligibility object
        if (this.isRequestingProvider === false && (this.selectedProviderId === '' || this.notInList === true)) {
            // If dependent section is not available, update the eligibility object
            if (this.dependentIndex === 0 || this.memberOrSubscriber === 'Member') {
                eligibilityObject = {
                    payer: this.selectedPayer === '-1' ? this.multiPayerObject : this.payerObject,
                    subscriber: subscriberObject,
                    service: serviceTypeObject,
                };
            } else {
                eligibilityObject = {
                    payer: this.selectedPayer === '-1' ? this.multiPayerObject : this.payerObject,
                    subscriber: subscriberObject,
                    dependent: dependentObject,
                    service: serviceTypeObject,
                };
            }
        } else {
            // If dependent section is not available, update the eligibility object with provider
            if (this.dependentIndex === 0 ||  this.memberOrSubscriber === 'Member') {
                eligibilityObject = {
                    payer: this.selectedPayer === '-1' ? this.multiPayerObject : this.payerObject,
                    payerProvider: this.providerObject,
                    subscriber: subscriberObject,
                    service: serviceTypeObject,
                };
            } else {
                eligibilityObject = {
                    payer: this.selectedPayer === '-1' ? this.multiPayerObject : this.payerObject,
                    payerProvider: this.providerObject,
                    subscriber: subscriberObject,
                    dependent: dependentObject,
                    service: serviceTypeObject,
                };
            }
        }

        localStorage.setItem('lastInquiry', 'eligibilityInquiry');
        const pageInformation =  {currentPage : this.currentOffset, pageSize: this.pageSize};
        if (this.selectedPayer === '-1') {
            const actualData = {
                eligibilityFormData: eligibilityObject,
                serviceCode: this.model.services,
                payerType: (this.selectedPayer === '-1') ? 'AllPayers' : 'SinglePayer',
                singleProviderSearch:  this.singleProviderSearch,
                payer: this.selectedPayer === '-1' ? this.multiPayerObject : this.model.userPayer,
                payerProvider: this.providerData,
                subscriber: subscriberObject,
                dependent: dependentObject,
                service: serviceTypeObject,
                recentProvider: this.recentProvider,
                searchParams: this.searchParameters,
                pageInfo: pageInformation
            };
            this.dataSharingService.setFormDataFromInquiryForm(actualData);
            localStorage.setItem('AllPayers',  'yes');
            localStorage.setItem('requestData',  JSON.stringify(eligibilityObject));
            localStorage.setItem('eligibilityFormData', JSON.stringify(actualData));
            localStorage.setItem('PayerList' , JSON.stringify(this.payerList));
            this.navigateToMultipleResponsePage(null, eligibilityObject);

        } else {
          //  If we need mock multiple response then uncomment below line and comment the submitEligibilityLine
            // this.eligibilityService.getEligibilityDetailsData()
                 this.eligibilityService.submitEligibilityInquiry(eligibilityObject)
                .takeUntil(this.unSubscribe).subscribe(
                eligibilityResponse => {
                    this.loaderService.display(false);
                    // Set form data to send to data sharing service
                    const inquiryFormData = {
                        eligibilityFormData: eligibilityObject,
                        serviceCode: this.model.services,
                        payerType: (this.selectedPayer === '-1') ? 'AllPayers' : 'SinglePayer',
                        singleProviderSearch:  this.singleProviderSearch,
                        payer: this.selectedPayer === '-1' ? this.multiPayerObject : this.model.userPayer,
                        payerProvider: this.providerData,
                        subscriber: subscriberObject,
                        dependent: dependentObject,
                        service: serviceTypeObject,
                        recentProvider: this.recentProvider,
                        searchParams: this.searchParameters,
                        pageInfo: pageInformation
                    };

                    // Set data to return to eligibility page on back button
                    localStorage.setItem('eligibilityFormData', JSON.stringify(inquiryFormData));
                    // Set data for populating data from the transaction shortcut menu
                    this.dataSharingService.setFormDataFromInquiryForm(inquiryFormData);
                    if (eligibilityResponse.length === 1) {
                        let AAARejectionArray = [];
                        AAARejectionArray = this.utils.findAAARejections(eligibilityResponse, AAARejectionArray);

                        if (AAARejectionArray.length !== 0) {
                            this.navigateToMultipleResponsePage(eligibilityResponse, eligibilityObject);
                        } else {
                            if (eligibilityResponse[0].plan && eligibilityResponse[0].plan.length !== 1) {
                                this.navigateToMultipleResponsePage(eligibilityResponse, eligibilityObject);
                            } else {
                                // Navigate to eligibility Details Page
                                this.dataSharingService.setSingleResponseDetail(eligibilityResponse);
                                this.route.navigate(['/client/eligibility/detail']);
                            }
                        }
                    } else {
                        this.navigateToMultipleResponsePage(eligibilityResponse, eligibilityObject);
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

    }

    navigateToMultipleResponsePage(multipleData, formData) {
        this.dataSharingService.setDataIfNoResponseFromPayer(formData);
        this.dataSharingService.setMultipleResponse(multipleData);
        this.route.navigate(['/client/eligibility/response']);
    }

    handleSSN(e) {
        return isSSN(e, e.target);
    }

    // HNP-5432
    verifyProvider(event) {
        if (this.payerConfigs.length > 0) {
            const config = this.payerConfigs.filter(x => x.configName === 'Requesting Provider')[0];
            if (config !== null && config.value === 'ACTIVE') {
                if (this.selectedProviderId === '' && this.notInList === false) {
                    this.showProviderMessage = true;
                }
            }
        }
    }

    // Pagination Code starts  -------------------------------------
    updatePageSize(event) {
        this.pageSize = event.value;

        this.currentOffset = 0;
        if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
            this.filterResults(this.sortIcon, this.singleProviderSearch);
        } else {
            this.filterProviders();
        }
    }

    nextPage(cls) {

        if (cls === 'next disabled') {
            return false;
        }
        this.selectedProviderId = '';
        this.currentOffset = this.currentOffset + 1;
        if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
            this.filterResults(this.sortIcon, this.singleProviderSearch);
        } else {
            this.filterProviders();
        }

    }

    prevPage(cls) {
        if (cls === 'pre disabled') {
            return false;
        }
        this.selectedProviderId = '';
        this.currentOffset = this.currentOffset - 1;
        if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
            this.filterResults(this.sortIcon, this.singleProviderSearch);
        } else {
            this.filterProviders();
        }
    }


    filterResults(icon, isSingleProviderSearch) {

        this.loaderService.display(true);
        if (icon === 'sort-icon asc') {
            this.sortIcon = 'sort-icon dec';
        } else {
            this.sortIcon = 'sort-icon asc';
        }
        const sortFields: SortFields  = {
            fieldName: 'lastName',
           // sortOrder: (icon === 'sort-icon asc') ?  'ASC' : 'DESC'
            sortOrder: 'ASC'
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

        if (isSingleProviderSearch) {
            this.sharedService.getRequestingProviders(this.selectedPayer, this.recentProvider, groupRequest)
                .takeUntil(this.unSubscribe).subscribe(
                data => {
                    this.providerList = data.results;
                    // this.cdr.markForCheck();
                    // this.cdr.detectChanges();
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
                        dtInstance.clear();
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
        } else {

            let id = this.userRole === 'PRACTICE_OFFICE_USER' ? this.adxTransactionId : this.permissionId;
            if (this.practiceOfficeUserMode) {
                id = this.adxTransactionId;
            }
            this.eligibilityService.getRequestingProvidersAllPayers(id, this.recentProvider, groupRequest)
                .takeUntil(this.unSubscribe).subscribe(
                data => {
                    this.providerList = data.results;
                    // this.cdr.markForCheck();
                    // this.cdr.detectChanges();
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
                        dtInstance.clear();
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

    }

    searchProviders(event) {
        this.selectedProviderId = '';
        if (event.target.value.length > 0 ) {
            if (event.key.toLowerCase() === 'enter') {
                this.keyword = event.target.value;
                this.filterResults(this.sortIcon, this.singleProviderSearch);
            }

        } else {
            this.keyword = '';
            this.filterResults(this.sortIcon, this.singleProviderSearch);
        }
    }
    // Search provider by button
    searchProvidersByClick() {
        if (this.keyword !== '') {
            this.selectedProviderId = '';
            this.filterResults(this.sortIcon, this.singleProviderSearch);
        }
    }

    // Pagination Code Ends  -------------------------------------

    searchProvidersByPayer(event) {
        if (event.keyCode === 13 || event.target.value === '') {
            this.selectedProviderId = '';
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
       if (this.selectedPayer !== '-1') {

           this.payerService.getRequestingProviders(this.selectedPayer, this.recentProvider, requestObj)
               .takeUntil(this.unSubscribe).subscribe(
               data => {
                   this.providerList = data.results;
                   // this.cdr.markForCheck();
                   // this.cdr.detectChanges();
                   this.totalRecords =  data.totalCount;
                   if ( this.totalRecords % this.pageSize === 0 ) {
                       this.totalPages =  this.totalRecords / this.pageSize ;
                   } else {
                       this.totalPages = Math.floor(  this.totalRecords / this.pageSize) + 1;
                   }

                   this.nextClass = (this.totalPages === (this.currentOffset + 1) || this.totalPages === 0) ? 'next disabled' : 'next';
                   this.preClass = (this.currentOffset === 0) ? 'pre disabled' : 'pre';

                   this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                       // Destroy the table first
                       dtInstance.clear();
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
       } else {
           this.payerService.getRequestingProviderForAllPayers(this.permissionId, this.recentProvider, requestObj)
               .takeUntil(this.unSubscribe).subscribe(
               data => {
                   this.providerList = data.results;
                   // this.cdr.markForCheck();
                   // this.cdr.detectChanges();
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
                       dtInstance.clear();
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

    }

    validateMedicaidForm() {

        if ( this.medicaidMemberNo === '' || this.medicaidMemberNo === null || !/^[0-9a-zA-Z]+$/.test(this.medicaidMemberNo)
            || this.medicaidMemberNo.length < 2 || this.medicaidMemberNo.length > 10) {
            return true;
        }
        if ( this.medicaidNpi === '' || this.medicaidNpi === null || !/^[0-9]+$/.test(this.medicaidNpi)
            || this.medicaidNpi.length < 10) {
            return true;
        }
        if (this.dateErrEligibility) {
            return true;
        }
        return false;
    }


    saveMedicaidInquiry() {
        localStorage.setItem('lastInquiry', 'eligibilityInquiry');
        this.loaderService.display(true);
        const providerObject = {
            npi: this.medicaidNpi,
        };

        const subscriberObject: SubscriberModel = {} as SubscriberModel;
        subscriberObject.memberNo = this.medicaidMemberNo.trim();


        const serviceTypeObject: ServiceTypeModel = {} as ServiceTypeModel;
        const arr:  any = [];
        serviceTypeObject.eligibilityDate = moment(this.model.eligibilityDate).format('YYYY-MM-DD');
        if (this.serviceLimit1 === true ) {
            arr.push(this.model.services);
            serviceTypeObject.serviceTypeCode = arr;
        } else {
            serviceTypeObject.serviceTypeCode = this.model.services;
        }
        const eligibilityObject = {
            payer:  this.payerObject,
            payerProvider: providerObject,
            subscriber: subscriberObject,
            service: serviceTypeObject,
        };
        const updatedSubscriberData = JSON.parse(JSON.stringify(subscriberObject));
        updatedSubscriberData.firstName = null;
        updatedSubscriberData.lastName = null;
        const formData = {
            payer:  this.model.userPayer,
            payerProvider: providerObject,
            subscriber: updatedSubscriberData,
            dependent: {},
            service: serviceTypeObject,
            recentProvider: false,
            searchParams: this.searchParameters
        };

        this.dataSharingService.setNavigateToOtherTransaction(formData);
        // If we need mock multiple response then uncomment below line and comment the submitEligibilityLine
        //   this.eligibilityService.getEligibilityMultipleResponseData().takeUntil(this.unSubscribe).subscribe(
        this.eligibilityService.submitEligibilityInquiry(eligibilityObject)
            .takeUntil(this.unSubscribe).subscribe(
            eligibilityResponse => {
                this.loaderService.display(false);
                // Set form data to send to data sharing service
                eligibilityObject.subscriber = updatedSubscriberData;
                const inquiryFormData = {
                    eligibilityFormData: eligibilityObject,
                    serviceCode: this.model.services,
                    payerType:  'SinglePayer',
                    searchParams: this.searchParameters,
                    singleProviderSearch:  true
                };


                // Set data to return to eligibility page on back button
                localStorage.setItem('eligibilityFormData', JSON.stringify(inquiryFormData));
                // Set data for populating data from the transaction shortcut menu
                this.dataSharingService.setFormDataFromInquiryForm(inquiryFormData);

                if (eligibilityResponse.length === 1) {
                    let AAARejectionArray = [];
                    AAARejectionArray = this.utils.findAAARejections(eligibilityResponse, AAARejectionArray);

                    if (AAARejectionArray.length !== 0) {
                        this.navigateToMultipleResponsePage(eligibilityResponse, eligibilityObject);
                    } else {
                        if (eligibilityResponse[0].plan && eligibilityResponse[0].plan.length !== 1) {
                            this.navigateToMultipleResponsePage(eligibilityResponse, eligibilityObject);
                        } else {
                            // Navigate to eligibility Details Page
                            this.dataSharingService.setSingleResponseDetail(eligibilityResponse);
                            this.route.navigate(['/client/eligibility/detail']);
                        }
                    }
                } else {
                    this.navigateToMultipleResponsePage(eligibilityResponse, eligibilityObject);
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

    navigateToTip() {
        this.tipURL = this.sanitizer.bypassSecurityTrustResourceUrl
        (encodeURI('http://wnyhealthenet.com/wp-content/uploads/2018/10/Tip-Sheet-Eligibility-and-Benefits.pdf'));
        window.open( this.tipURL.changingThisBreaksApplicationSecurity );
    }

    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }



}

