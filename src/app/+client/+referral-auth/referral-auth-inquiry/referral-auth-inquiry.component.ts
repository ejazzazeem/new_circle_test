import {
  Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit, NgZone, OnDestroy,
  ChangeDetectorRef, ChangeDetectionStrategy, HostListener
} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Subject';
import { AlertService, LoaderService, UtilsService, DataSharingService,
  ReferralAuthService, UserSessionService, SharedService, PayerDetailsService } from '@services/index';
import { Page, SortFields, DataRequest } from '@models/index';
import { Router } from '@angular/router';
import * as moment from 'moment';
import {isNullOrUndefined} from 'util';
declare function isNumberKey(e, target): any;
declare function isValidDate(e): any;
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-referral-auth-inquiry',
  templateUrl: './referral-auth-inquiry.component.html',
  styleUrls: ['./referral-auth-inquiry.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class ReferralAuthInquiryComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('submitBtn') btn: any;
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  model: any = {
    payer: {},
    payerProvider: {},
    subscriber: {},
    dependent: {},
    referralAuthInformation: {}
  };
  providerObject = {};
  payerList = [];
  providerList = [];
  payerSettings: any;
  payerConfigs = [];
  memberOrSubscriber: String = 'Member';
  inquiryType = 'referral';
  recentProvider = false;
  payerId = '';
  permissionId = '';
  permissionName = 'Referral / Authorization Status Inquiry';
  maxDate: Date;
  minDate: Date;
  startDate: Date;
  endDate: Date;
  customDateCheck: boolean;
  dateMsgSubscriber: String  = null;
  dateMsgDependent: String = null;
  dateMsgReferralFrom: String = null;
  dateMsgReferralTo: String = null;
  memberError: string;
  dependentError: string;
  subscriberIndex: number;
  subscriberCheck: number;
  dependentIndex: number;
  showProviderMessage = false;
  userRole: string;
  userInfo: any = {};
// server side pagination
  pageSize = 100;
  currentOffset = 0;
  totalPages = 0;
  preClass = 'pre disabled';
  nextClass = 'next';
  sortIcon = 'sort-icon asc';
  searchKeyword = '';
  totalRecords = 0;
  inquiryData: any;
  searchParameters: any = {};
  private unSubscribe = new Subject();
  tableClass = 'common-datatable grid-table table-striped';
  tabClass = 'tabs-main-container';
  searchedProvider: any = {};
  practiceOfficeUserMode = false;
  adxTransactionId = '';
  isRequestingProvider = false;
  selectedTabIndex = 0;
  categoryType = [
    {id: 1, code: 'AR', name: 'Admission'},
    {id: 2, code: 'HS', name: 'Health Services Review'}
  ];
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
          contextualRef.saveInquiry();
        }
      }, 250);
    }
  }

  constructor(private referralAuthService: ReferralAuthService,
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
              private sanitizer: DomSanitizer) { }

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
    this.model.referralAuthInformation.categoryCode = this.categoryType[0].code;
    this.minDate = new Date(1900, 0, 1); // user cannot select date before 1900
    this.maxDate = new Date(); // user cannot select future date for DOB

    // Setting the BOD
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
          if (this.inquiryData.payer) {
            this.getUserPayers();
          }
          if (this.inquiryData.subscriber) {
            this.model.subscriber.memberNo = this.inquiryData.subscriber.memberNo;
            this.model.subscriber.firstName = this.inquiryData.subscriber.firstName;
            this.model.subscriber.lastName = this.inquiryData.subscriber.lastName;
            // this.model.dateOfBirthSubscriber = this.inquiryData.subscriber.dateOfBirth;
            this.model.dateOfBirthSubscriber = moment(this.inquiryData.subscriber.dateOfBirth).toISOString();
          }
          if (this.inquiryData.referralAuthInformation) {
            this.model.referralAuthInformation.referralId = this.inquiryData.referralAuthInformation.referralId;
            this.startDate = this.inquiryData.startDate;
            this.endDate = this.inquiryData.endDate;
            this.inquiryType =  this.inquiryData.inquiryType;
            this.model.referralAuthInformation.categoryCode = this.inquiryData.referralAuthInformation.categoryCode;
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

  addMonths(date, months) {
    date.setMonth(date.getMonth() + months);
    return date;
  }

  // Validate DOB
  validateDOB(e) {
    return this.utils.isValid(e.target.value) ? isValidDate(e.target.value) ?
        new Date(e.target.value).getTime() < new Date('01/01/1900').getTime() ? 'Date should be greater or equals to 01/01/1900' :
            new Date(e.target.value).getTime() > new Date().getTime() ? 'Date of birth cannot be a future date' :
                null : 'Invalid date.' : null;
  }

  // Validate from date
  validateStartDate(e) {
    this.customDateCheck = (this.startDate > this.endDate);
    return this.utils.isValid(e.target.value) ? isValidDate(e.target.value) ?
        new Date(e.target.value).getTime() < new Date('01/01/1900').getTime() ? 'Date should be greater or equals to 01/01/1900' :
            // Please uncomment this line if future validation is required
            // new Date(e.target.value).getTime() > new Date().getTime() ? 'Start date cannot be a future date' :
                null : 'Invalid date.' : null;
  }

  // Validate to date
  validateEndDate(e) {
    this.customDateCheck = (this.startDate > this.endDate);
    return this.utils.isValid(e.target.value) ? isValidDate(e.target.value) ? this.utils.isValid(this.startDate) ?
        null : 'Please select Start date first.' : 'Invalid date.' : null;
  }

  onChange(date) {
    if (date === null) {
      this.endDate = null;
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
                this.updatePayer(this.inquiryData.payer);
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
              if (this.inquiryData.dependent) {
                this.model.dependent.firstName = this.inquiryData.dependent.firstName;
                this.model.dependent.lastName = this.inquiryData.dependent.lastName;
                // this.model.dateOfBirthDependent = this.inquiryData.dependent.dateOfBirth;
                this.model.dateOfBirthDependent = moment(this.inquiryData.dependent.dateOfBirth).toISOString();
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

  // Get payer specific settings for transaction permission
  getPermissionSettings() {
    this.sharedService.getPermissionSetting(this.model.payer.payerId, this.adxTransactionId)
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          this.payerConfigs = [];
          this.payerSettings = data;
          this.cdr.detectChanges();

          this.payerSettings.onOffConfigs.forEach(obj => {
            this.payerConfigs.push(obj);
          });
          for (let i = 0; i < this.payerConfigs.length; i++) {
            if (this.payerConfigs[i].configName === 'Member Information Settings') {
              this.memberOrSubscriber = this.payerConfigs[i].value === 'ACTIVE' ? 'Member' : 'Subscriber';
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
    if (this.model.payer.payerId !== undefined) {
      this.loaderService.display(true);
      this.sortIcon = 'sort-icon asc';
      this.totalRecords = 0;
      this.filterResults(this.sortIcon);
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
    this.model.payerProvider.firstName  = this.utils.isValid(provider.firstName) ?
        provider.firstName : null;
    // Payer provider address
    this.model.payerProvider.address.city = provider.serviceCity;
    this.model.payerProvider.address.state = provider.serviceState;
    this.model.payerProvider.address.zipCode = provider.serviceZip;
    this.model.payerProvider.address.line1 = provider.serviceAddressLine1;
    this.model.payerProvider.address.line2 = provider.serviceAddressLine2;

    this.providerObject = {
      npi: provider.npi,
      taxId: provider.taxId,
      providerId: provider.providerId,
      lastName: provider.lastName,
      taxonomy: provider.taxonomy,
      firstName: provider.firstName,
      serviceAddressLine1: provider.serviceAddressLine1
    };
  }

  validateForm() {
    // If payer is not selected the submit button will be disabled
    let i = 0, j = 0, z = 0;

    if (this.utils.isValid(this.model.referralAuthInformation.referralId) &&
        this.model.referralAuthInformation.referralId.trim().length > 0 ) {
      i++;
    }
    if (this.utils.isValid(this.model.subscriber.memberNo) && this.model.subscriber.memberNo.trim().length > 0) {
      i++;
      z++;
    }
    if (this.utils.isValid(this.model.subscriber.firstName) || this.utils.isValid(this.model.subscriber.lastName) ||
        this.utils.isValid(this.model.dateOfBirthSubscriber)) {
      z++;
    }
    if (this.utils.isValid(this.startDate) && this.utils.isValid(this.endDate) &&
        this.dateMsgReferralFrom === null && this.dateMsgReferralTo === null ) {
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
    if (this.utils.isValid(this.model.dateOfBirthDependent) && this.dateMsgDependent === null) {
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
    if (this.utils.isValid(this.startDate) || this.utils.isValid(this.endDate)) {
      if (!(this.utils.isValid(this.startDate) && this.utils.isValid(this.endDate))) {
        return true;
      }
    }

    if ((this.utils.isValid(this.model.subscriber.memberNo) && this.model.subscriber.memberNo.trim().length > 0) &&
        this.utils.isValid(this.startDate) &&
        this.utils.isValid(this.endDate) &&
        this.utils.isValid(this.model.payer.payerId) &&
        !isNullOrUndefined(this.model.payerProvider)) {
      return !this.utils.isValid(this.model.payerProvider.id);
    }

    if (this.utils.isValid(this.model.payer.payerId) &&
        !isNullOrUndefined(this.model.payerProvider) &&
        (this.utils.isValid(this.model.referralAuthInformation.referralId) &&
        this.model.referralAuthInformation.referralId.trim().length > 0) &&
        (this.utils.isValid(this.model.subscriber.memberNo) && this.model.subscriber.memberNo.trim().length > 0)) {
      return false;
    }
    return true;
  }

  checkSubscriber() {
    // Check Subscriber when the dependent section is started
    this.memberError = '';
    this.memberError = this.subscriberIndex < 2 ?
        'Please enter either ' + this.memberOrSubscriber + ' # and referral ID # or ' + this.memberOrSubscriber + ' # and date range' : '';
    if (isNullOrUndefined(this.model.payerProvider)) {
      this.showProviderMessage = true;
    }
  }


  saveInquiry() {
    this.loaderService.display(true);
    this.model.referralAuthInformation.certificationDateRange = this.utils.getClaimServiceDate(this.startDate, this.endDate);
    this.model.subscriber.dateOfBirth = this.utils.isValid(this.model.dateOfBirthSubscriber) ?
        moment(this.model.dateOfBirthSubscriber).format('YYYY-MM-DD') : null;
    this.model.dependent.dateOfBirth = this.utils.isValid(this.model.dateOfBirthDependent) ?
        moment(this.model.dateOfBirthDependent).format('YYYY-MM-DD') : null;

    if (!isNullOrUndefined(this.model.subscriber.firstName)) {
      this.model.subscriber.firstName = this.model.subscriber.firstName.trim();
    }
    if (!isNullOrUndefined(this.model.subscriber.lastName)) {
      this.model.subscriber.lastName = this.model.subscriber.lastName.trim();
    }
    if (!isNullOrUndefined(this.model.subscriber.memberNo)) {
      this.model.subscriber.memberNo = this.model.subscriber.memberNo.trim();
    }
    if (!isNullOrUndefined(this.model.dependent.firstName)) {
      this.model.dependent.firstName = this.model.dependent.firstName.trim();
    }
    if (!isNullOrUndefined(this.model.dependent.lastName)) {
      this.model.dependent.lastName = this.model.dependent.lastName.trim();
    }


    let referralObject = { };
    const referralInfo = {
      referralId : this.utils.isValid(this.model.referralAuthInformation.referralId) ?
          this.model.referralAuthInformation.referralId.trim() : null ,
      categoryCode : (this.inquiryType === 'referral') ? 'SC' : this.model.referralAuthInformation.categoryCode ,
      certificationDateRange : this.model.referralAuthInformation.certificationDateRange,
    };

    if (this.dependentIndex === 0 || this.memberOrSubscriber === 'Member') {
      referralObject = (this.subscriberCheck === 0)  ? {
        payer : this.model.payer,
        payerProvider: this.model.payerProvider,
        referralAuthInformation: referralInfo
      } : {
        payer : this.model.payer,
        payerProvider: this.model.payerProvider,
        subscriber: this.model.subscriber,
        referralAuthInformation: referralInfo
      };
    } else {
      referralObject = (this.subscriberCheck === 0) ? {
        payer : this.model.payer,
        payerProvider: this.model.payerProvider,
        dependent: this.model.dependent,
        referralAuthInformation: referralInfo
      } : {
        payer : this.model.payer,
        payerProvider: this.model.payerProvider,
        subscriber: this.model.subscriber,
        dependent: this.model.dependent,
        referralAuthInformation: referralInfo
      };
    }
    const pageInformation =  {currentPage : this.currentOffset, pageSize: this.pageSize};
    const referralData = {
      payer : this.model.payer.payerId,
      payerProvider: this.providerObject,
      subscriber: this.model.subscriber,
      dependent: this.model.dependent,
      referralAuthInformation: referralInfo,
      searchParams: this.searchParameters,
      startDate: this.startDate,
      endDate: this.endDate,
      recentProvider: this.recentProvider,
      checkRecent: this.recentProvider,
      inquiryType: this.inquiryType,
      pageInfo: pageInformation
    };
    const lastInquiry = 'referralAuthInquiry';
    localStorage.setItem('lastInquiry', lastInquiry);

    this.referralAuthService.submitReferralAuthInquiry(referralObject)
        .takeUntil(this.unSubscribe).subscribe(
        referralAuthResponse => {
          this.loaderService.display(false);
          this.dataService.setFormDataFromInquiryForm(referralData);
          if (referralAuthResponse.referralAuth.length === 1) {
            let AAARejectionArray = [];
            AAARejectionArray = this.utils.findAAARejections(referralAuthResponse, AAARejectionArray);

            if (AAARejectionArray.length !== 0) {
              this.navigateToMultipleResponsePage(referralAuthResponse, referralObject);
            } else {
              // Navigate to eligibility Details Page
              this.dataService.setSingleResponseDetail(referralAuthResponse);
              this.route.navigate(['/client/referral-auth/detail']);
            }
          } else {
            this.navigateToMultipleResponsePage(referralAuthResponse, referralObject);
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

  navigateToMultipleResponsePage(multipleData, formData) {
    this.dataService.setDataIfNoResponseFromPayer(formData);
    this.dataService.setMultipleResponse(multipleData);
    this.route.navigate(['/client/referral-auth/multi-response']);
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
      keyword : this.searchKeyword,
      sortField : {
        page : page,
        sortField: sortFields
      }
    };

    this.sharedService.getRequestingProviders(this.model.payer.payerId, this.recentProvider, groupRequest)
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
        this.searchKeyword = event.target.value;
        this.filterResults(this.sortIcon);
      }

    } else {
      this.searchKeyword = '';
      this.filterResults(this.sortIcon);
    }
  }
  // Search provider by button
  searchProvidersByClick() {
    if (this.searchKeyword !== '') {
      this.model.payerProvider = null;
      this.filterResults(this.sortIcon);
    }
  }

  // Pagination Code Ends  -------------------------------------


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

  navigateToTip() {
    this.tipURL = this.sanitizer.bypassSecurityTrustResourceUrl
    (encodeURI('http://wnyhealthenet.com/wp-content/uploads/2018/10/Tip-Sheet-Referral-Authorization-Inquiry.pdf'));
    window.open( this.tipURL.changingThisBreaksApplicationSecurity );
  }
}
