import {
    Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit, NgZone, OnDestroy,
    ChangeDetectorRef, ChangeDetectionStrategy, HostListener
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { MessageDialogComponent } from '@misc/client/message-dialog/index';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Subject';
import { AlertService, LoaderService, UtilsService, SharedService,
    ProviderService, UserSessionService, DataSharingService, PayerDetailsService } from '@services/index';
import { Page, SortFields, DataRequest } from '@models/index';
import { Router } from '@angular/router';
import {isNullOrUndefined} from 'util';
import * as constants from '@misc/constant';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
    selector: 'app-provider-inquiry',
    templateUrl: './provider-inquiry.component.html',
    styleUrls: ['./provider-inquiry.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class ProviderInquiryComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild(DataTableDirective) dtElement: DataTableDirective;
    @ViewChild('submitBtn') btn: any;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new  Subject();
    model: any = {
        payer: {},
        payerProvider: {},
        patient: {},
        claimInfo: {},
        contactInfo: {},
    };
    payerList = [];
    providerList = [];
    recentProvider = false;
    showProviderMessage = false;
    dialogMessage: string;
    dialogColor: string;
    // server side pagination
    pageSize = 100;
    currentOffset = 0;
    totalPages = 0;
    preClass = 'pre disabled';
    nextClass = 'next';
    sortIcon = 'sort-icon asc';
    keyword = '';
    totalRecords = 0;
    actualFileData: any = {};
    searchParams: any = {};
    fileName = '';
    fileType = '';
    permissionId = '';
    isRequestingProvider = false;
    selectedInquirytype: any = [];
    inquiryTypes = constants.inquiryTypes;
    permissionName = 'Provider Inquiry';
    acceptedTypes = ['image/png', 'image/tiff', 'image/bmp', 'image/gif', 'image/jpeg', 'text/html', 'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-powerpoint',
        'application/pdf', 'application/rtf', 'text/plain', 'text/xml'];
    fileUploaded = false;
    fileErrorMessage = false;
    fileMessage = 'Invalid file format';
    fileSize = 0;
    userRole: string;
    userInfo: any = {};
    inquiryData: any;
    selectedTabIndex = 0;
    private unSubscribe = new Subject();
    tableClass = 'common-datatable grid-table table-striped';
    tabClass = 'tabs-main-container';
    searchedProvider: any = {};
    practiceOfficeUserMode = false;
    adxTransactionId = '';
    tipURL: any;
    isAttaching = false;
    // HNP-5431
    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event) {
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

    constructor(private providerService: ProviderService,
                private userSessionService: UserSessionService,
                private alertService: AlertService,
                private loaderService: LoaderService,
                private route: Router,
                private utils: UtilsService,
                public dialog: MatDialog,
                private zone: NgZone,
                private dataService: DataSharingService,
                private sharedService: SharedService,
                private payerService: PayerDetailsService,
                private cdr: ChangeDetectorRef,
                private sanitizer: DomSanitizer) {
        this.route.routeReuseStrategy.shouldReuseRoute = function() { return false; };
    }

    ngAfterViewInit(): void {
        this.dtTrigger.next();
    }

    ngOnInit() {
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
            },
        };

        // Check if permission (transaction) exist for the user (in the permission list)
        // if not then redirect to home page
        const permissionList = JSON.parse(localStorage.getItem('permissionList'));
        if ((permissionList.filter(x => x.name === this.permissionName)) < 1) {
            this.route.navigate(['/client/home']);
        }
        this.dataService.getClaimFormData.takeUntil(this.unSubscribe).subscribe(
            data => {
                this.inquiryData = data;

                if (this.inquiryData) {
                    if (this.inquiryData.recentProvider) {
                        this.selectedTabIndex = 1;
                    }
                    if (this.inquiryData.claim) {
                        this.model.claimInfo.claimNumber = this.inquiryData.claim.claimNumber;
                        this.model.patient.patientAccount = this.inquiryData.claim.patientAccountNumber;
                    }
                    if (this.inquiryData.subscriber) {
                        this.model.patient.memberId = this.inquiryData.subscriber.memberNo;
                        this.model.patient.firstName = this.inquiryData.subscriber.firstName;
                        this.model.patient.lastName = this.inquiryData.subscriber.lastName;
                    }
                    if (this.inquiryData.contactInfo) {
                        this.model.contactInfo.firstName = this.inquiryData.contactInfo.firstName;
                        this.model.contactInfo.lastName = this.inquiryData.contactInfo.lastName;
                        this.model.contactInfo.phone = this.inquiryData.contactInfo.phone;
                        this.model.contactInfo.email = this.inquiryData.contactInfo.email;
                    }
                    if (this.inquiryData.inquiryType) {
                        this.selectedInquirytype = this.inquiryData.inquiryType;
                    }
                    if (this.inquiryData.claimInfo) {
                        this.model.claimInfo.message = this.inquiryData.claimInfo.message;
                        this.model.claimInfo.claimNumber = this.inquiryData.claimInfo.claimNumber;
                    }
                }
            });
        const lastInquiry = 'providerInquiry';
        localStorage.setItem('lastInquiry', lastInquiry);

        // Get the permission List from local storage and fetch/set the specific permission Id for this page
        this.permissionId = this.utils.setPermissionIdInLocalStorage(this.permissionName);
        this.adxTransactionId = this.utils.getAdxId(this.permissionName);

        // Getting permission Id from local storage
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
            this.getUserPayers();
            this.populateUserFields(this.userInfo);
        } else {
            // Loads Information from User Session Service
            this.userSessionService.getUserSessionInfo()
                .takeUntil(this.unSubscribe).subscribe(
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
                    this.populateUserFields(this.userInfo);
                    this.loaderService.display(false);
                },
                error => {
                    this.loaderService.display(false);
                    this.alertService.error(error.error.errors[0].endUserMessage);
                }
            );
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
                this.payerList = data;
                this.cdr.detectChanges();

                this.payerList.forEach(obj => {
                    if ( obj.payerId === this.inquiryData.payer) {
                        if (this.inquiryData.payer) {
                            this.model.userPayer = this.inquiryData.payer;
                            this.updatePayer(this.inquiryData.payer);
                        }
                        if (this.inquiryData.searchParams) {
                            this.searchedProvider = this.inquiryData.searchParams;
                        }
                        if (obj.payerId === this.inquiryData.payer) {
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
                        }
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
        }
    }

    // If Providers are recent
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
        this.model.payerProvider.firstName  = this.utils.isValid(provider.firstName) ?
            provider.firstName : null;
        // Payer provider address
        this.model.payerProvider.address.city = provider.serviceCity;
        this.model.payerProvider.address.state = provider.serviceState;
        this.model.payerProvider.address.zipCode = provider.serviceZip;
        this.model.payerProvider.address.line1 = provider.serviceAddressLine1;
        this.model.payerProvider.address.line2 = provider.serviceAddressLine2;
    }

    // Validate Form
    validateForm() {
        // Payer, Provider, the Inquiry Information type and the Message contents are required Fields to submit the form
        // If payer and Provider are not selected the submit button will be disabled
        if (this.utils.isValid(this.inquiryTypes) &&
            this.utils.isValid(this.model.claimInfo.message) && this.model.claimInfo.message.trim().length > 0 &&
            this.utils.isValid(this.model.payer.payerId) &&
            !isNullOrUndefined(this.model.payerProvider)) {
            return !this.utils.isValid(this.model.payerProvider.id);
        }
        return true;
    }

    saveInquiry() {
        this.loaderService.display(true);
        const attachment: any = {
            file: this.actualFileData,
            fileName: this.fileName,
            fileSize: this.fileSize,
            fileContentType:  this.fileType
        };
        if (!isNullOrUndefined(this.model.patient.memberId)) {
            this.model.patient.memberId = this.model.patient.memberId.trim();
        }
        if (!isNullOrUndefined(this.model.patient.patientAccount)) {
            this.model.patient.patientAccount = this.model.patient.patientAccount.trim();
        }
        if (!isNullOrUndefined(this.model.patient.firstName)) {
            this.model.patient.firstName = this.model.patient.firstName.trim();
        }
        if (!isNullOrUndefined(this.model.patient.lastName)) {
            this.model.patient.lastName = this.model.patient.lastName.trim();
        }
       if (!isNullOrUndefined(this.model.claimInfo.claimNumber)) {
           this.model.claimInfo.claimNumber = this.model.claimInfo.claimNumber.trim();
       }
       if (this.model.contactInfo.firstName === null || this.model.contactInfo.firstName === undefined ||
           this.model.contactInfo.firstName.trim() === '') {
           this.model.contactInfo.firstName = null;
       } else {
           this.model.contactInfo.firstName = this.model.contactInfo.firstName.trim();
       }
        if (this.model.contactInfo.lastName === null || this.model.contactInfo.lastName === undefined ||
            this.model.contactInfo.lastName.trim() === '') {
            this.model.contactInfo.lastName = null;
        } else {
            this.model.contactInfo.lastName = this.model.contactInfo.lastName.trim();
        }
        if (!isNullOrUndefined(this.model.contactInfo.phone)) {
            this.model.contactInfo.phone =this.model.contactInfo.phone.trim();
        }
        if (!isNullOrUndefined(this.model.contactInfo.email)) {
            this.model.contactInfo.email = this.model.contactInfo.email.trim();
        }


        // If file is uploaded, attachment object will be added
      //  if (Object.keys(attachment.file).length > 0) {
        //    this.model.claimInfo.attachment = attachment;
       // }
         let _contactInfo = this.model.contactInfo;
        if (!isNullOrUndefined(_contactInfo.firstName)) {
            _contactInfo.firstName = _contactInfo.firstName.replace(/\W/g, '').trim();
        } else {
            _contactInfo.firstName = null;
        }
        if (!isNullOrUndefined(_contactInfo.lastName)) {
            _contactInfo.lastName = _contactInfo.lastName.replace(/\W/g, '').trim();
        } else {
            _contactInfo.lastName = null;
        }





        const providerObject: any = {
            payer: this.model.payer,
            payerProvider: this.model.payerProvider,
            attachment: this.fileUploaded ?  attachment : null,
            contactInfo: _contactInfo,
            claimId: (this.model.claimInfo.claimNumber === null || this.model.claimInfo.claimNumber === undefined) ?
                '' : this.model.claimInfo.claimNumber ,
            providerRequestMessage: this.model.claimInfo.message,
            inquiryType: this.selectedInquirytype
        };

        if (this.model.contactInfo.phone === '') {
            providerObject.contactInfo.phone = null;
        }
        // If Provider inquiry Summary Filter are added, patient object will be created
        if (Object.keys(this.model.patient).length > 0) {
            providerObject.patient = this.model.patient;
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
            remitAddressLine1: this.model.payerProvider.address.line1,
            remitAddressLine2: this.model.payerProvider.address.line2
        };
        const providerObjectData = {
            payer: this.model.payer.payerId,
            payerProvider: providerData,
            attachment: this.fileUploaded ?  attachment : null,
            contactInfo: this.model.contactInfo,
            claimInfo: this.model.claimInfo,
            inquiryType: this.selectedInquirytype,
            searchParams: this.searchParams,
            checkRecent: this.recentProvider
        };
        this.dataService.setFormDataFromInquiryForm(providerObjectData);

        // Call SUBMIT PROVIDER INQUIRY Service and then If the transaction is successful, show success msg
        // If there is an error, show error msg
        this.providerService.submitProviderInquiry(providerObject)
            .takeUntil(this.unSubscribe).subscribe(
            data => {
                this.loaderService.display(false);
                if (data.length < 1) {
                    // If there is an error, the user should see a persisted message
                    this.dialogMessage = 'Something went wrong. Please try again.';
                    this.dialogColor = 'red';
                    this.openDialog();
                } else {
                    // If the transaction is successful, a success message with an inquiry ID should be returned to the user
                    this.dialogMessage =
                        'Your inquiry has been received and is Pending. Your Inquiry ID is ' + data.inquiryId;
                    this.dialogColor = 'green';
                    this.openDialog();
                }
            }, error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
    }

    // HNP-5432
    verifyProvider() {
        if (isNullOrUndefined(this.model.payerProvider)) {
            this.showProviderMessage = true;
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

        this.sharedService.getRequestingProviders(this.model.payer.payerId,
            this.recentProvider, groupRequest).takeUntil(this.unSubscribe).subscribe(
            data => {
                this.providerList = data.results;
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

    populateUserFields(user) {
        this.providerService.getUserByUserId(user.userId).takeUntil(this.unSubscribe).subscribe(
            data => {
                this.model.contactInfo.firstName = data.firstName;
                this.model.contactInfo.lastName = data.lastName;
                this.model.contactInfo.phone = data.phoneNumber;
                this.model.contactInfo.email = data.email;
                this.loaderService.display(false);
            },
            error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            });
    }


    fileReader(files) {

        const reader = new FileReader();
        const contextualReference = this;
        reader.onloadstart = function (e) {
            contextualReference.isAttaching = true;
        };
        reader.onload = function (e) {
            contextualReference.actualFileData = reader.result.split(',')[1]; // get base64 encoded value of PDF document
        };
        reader.onloadend = function (e) {
            contextualReference.isAttaching = false;
        };
        if (files[0]) {
            this.fileName = files[0].name;
            this.fileType = files[0].type;
            this.fileSize = files[0].size;
            if (this.acceptedTypes.filter(x => x === this.fileType.toLowerCase()).length === 0) {
                contextualReference.fileUploaded = false;
                this.fileErrorMessage = true;
                this.fileMessage = 'Invalid file format';
                this.isAttaching = false;
            } else {
                if (this.fileSize >= 20971520) {
                    contextualReference.fileUploaded = false;
                    this.fileErrorMessage = true;
                    this.fileMessage = 'File must be less than 20MB';
                    this.isAttaching = false;
                } else {
                    this.isAttaching = true;
                    this.fileErrorMessage = false;
                    contextualReference.fileUploaded = true;
                    this.fileMessage = '';
                    reader.readAsDataURL(files[0]);

                }

            }
        }
    }

    // Success and error msg dialog
    openDialog(): void {
        const dialogRef = this.dialog.open(MessageDialogComponent, {
            disableClose: true,
            data: {
                'dialogMessage': this.dialogMessage,
                'dialogColor': this.dialogColor
            }
        });

        dialogRef.afterClosed().takeUntil(this.unSubscribe).subscribe(result => {
            if (this.dialogColor === 'green') {
                this.route.navigated = false;
                this.route.navigate([this.route.url]);
                this.loaderService.display(false);
            }
        });
    }

    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }

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
        this.searchParams = requestingProvider;
        const requestObj: any = {'findParameter': findParameter , 'provider': requestingProvider  };

        this.payerService.getRequestingProviders(this.model.payer.payerId, this.recentProvider, requestObj)
            .takeUntil(this.unSubscribe).subscribe(
            data => {
                this.providerList = data.results;
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
    navigateToTip() {
        this.tipURL = this.sanitizer.bypassSecurityTrustResourceUrl
        (encodeURI('http://wnyhealthenet.com/wp-content/uploads/2018/10/Tip-Sheet-Provider-Inquiry.pdf'));
        window.open( this.tipURL.changingThisBreaksApplicationSecurity );
    }
}
