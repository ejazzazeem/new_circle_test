import {
  Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit, NgZone, OnDestroy,
  ChangeDetectorRef, ChangeDetectionStrategy, HostListener
} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Subject';
import { AlertService, LoaderService, UtilsService, DataSharingService, SharedService,
    ProviderService, UserSessionService, PayerDetailsService } from '@services/index';
import { Page, SortFields, DataRequest } from '@models/index';
import { Router } from '@angular/router';
import {isNullOrUndefined} from 'util';
import * as constants from '@misc/constant';
declare function isNumberKey(e, target): any;
declare function isValidDate(e): any;
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
@Component({
  selector: 'app-provider-inquiry-status',
  templateUrl: './provider-inquiry-status.component.html',
  styleUrls: ['./provider-inquiry-status.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class ProviderInquiryStatusComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  model: any = {
    payer: {},
    patient: {},
    payerProvider: {},
    inquiryDateRange: {},
    inquirySummaryFilter: {},
  };
  payerList = [];
  providerList = [];
  recentProvider = false;
  maxDate: Date;
  minDate: Date;
  fromDate: Date;
  toDate: Date;
  customDateCheck: boolean;
  dateMsgProviderFrom: String = null;
  dateMsgProviderTo: String = null;
  showProviderMessage = false;
  permissionId = '';
  permissionName = 'Provider Inquiry Summary';
  // server side pagination
  pageSize = 100;
  currentOffset = 0;
  totalPages = 0;
  preClass = 'pre disabled';
  nextClass = 'next';
  sortIcon = 'sort-icon asc';
  keyword = '';
  totalRecords = 0;
  userRole: string;
  userInfo: any = {};
  inquiryTypes = constants.inquiryTypes;
  private unSubscribe = new Subject();
  tableClass = 'common-datatable grid-table table-striped';
  tabClass = 'tabs-main-container';
  searchedProvider: any = {};
  practiceOfficeUserMode = false;
  adxTransactionId = '';
  isRequestingProvider = false;
  @ViewChild('submitBtn') btn: any;
  rangeInfo = false;
  formData: any = {};
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

  constructor(private providerService: ProviderService,
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

    this.minDate = this.addMonths( new Date(), -6) ; // user cannot select date before last 6 months
    this.minDate.setHours(0, 0, 0, 0); // Ignoring time while setting minimum date
    this.maxDate = new Date(); // user cannot select future date for DOB

    // HNP-9106
    this.fromDate = this.addMonths( new Date(), -1); // From date should default to -1 month from the current date
    this.toDate = new Date(); // To date should default to the current date

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

    // Get the permission List from local storage and fetch/set the specific permission Id for this page
    this.permissionId = this.utils.setPermissionIdInLocalStorage(this.permissionName).split('_')[0];
    this.adxTransactionId = this.utils.getAdxId('Provider Inquiry');
    // Getting permission Id from local storage
    const currentUser = localStorage.getItem('currentUser');

    this.formData = JSON.parse( localStorage.getItem('InquiryData'));
    if (this.formData !== null && this.formData !== undefined && Object.keys(this.formData).length > 0) {
      localStorage.removeItem('InquiryData');
      this.fromDate = this.formData.fromDate;
      this.toDate = this.formData.toDate;
      this.model.patient = this.formData.patient;
      this.model.inquirySummaryFilter.inquiryType = this.formData.inquiryType;
      this.model.currentUserOnly = this.formData.currentUserOnly;
      this.model.inquirySummaryFilter.inquiryType = this.formData.inquiryType;
      this.model.inquirySummaryFilter.inquiryStatus = this.formData.inquiryStatus;
      this.model.inquirySummaryFilter.inquiryId = this.formData.inquiryId;
      this.model.inquirySummaryFilter.claimId = this.formData.claimId;
      const pageInfo = JSON.parse( localStorage.getItem('pageInfo'));
      localStorage.removeItem('pageInfo');
      if (pageInfo) {
        this.pageSize = pageInfo.pageSize;
        this.currentOffset = pageInfo.currentPage;
      }
    }

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

    // Check if permission (transaction) exist for the user (in the permission list)
    // if not then redirect to home page
    const permissionList = JSON.parse(localStorage.getItem('permissionList'));
    if ((permissionList.filter(x => x.name === this.permissionName.split(' Summary')[0])) < 1) {
      this.route.navigate(['/client/home']);
    }
  }

  // Calculating last 6 months from current date
  addMonths(date, months) {
    date.setMonth(date.getMonth() + months);
    return date;
  }

  // date validation
  handledate(e) {
    return isNumberKey(e, e.target);
  }

  // Validate from date
  validateFromDate(e) {
    if (isNullOrUndefined(this.model.payerProvider)) {
      this.showProviderMessage = true;
    }
    this.customDateCheck = (this.fromDate > this.toDate);
    return this.utils.isValid(e.target.value) ? isValidDate(e.target.value) ?
        new Date(e.target.value).getTime() < this.addMonths(new Date(), -6).setHours(0, 0, 0, 0) ?
            'Date should be within the past 6 months' :
            new Date(e.target.value).getTime() > new Date().getTime() ? 'From date cannot be a future date' :
                null : 'Invalid date.' : null;
  }

  // Validate to date
  validateToDate(e) {
    if (isNullOrUndefined(this.model.payerProvider)) {
      this.showProviderMessage = true;
    }
    this.customDateCheck = (this.fromDate > this.toDate);
    return this.utils.isValid(e.target.value) ? isValidDate(e.target.value) ? this.utils.isValid(this.fromDate) ?
        new Date(e.target.value).getTime() > new Date().getTime() ? 'To date cannot be a future date' :
            null : 'Please select From date first.' : 'Invalid date.' : null;
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
          if (this.formData !== null && this.formData !== undefined && Object.keys(this.formData).length > 0) {
          this.payerList.forEach(obj => {
              if ( obj.payerId === this.formData.payer.payerId) {
                if (this.formData.payer) {
                  this.model.userPayer = this.formData.payer.payerId;
                  this.updatePayer(this.model.userPayer);
                }
                const providerObj =  JSON.parse(localStorage.getItem('query'));
                localStorage.removeItem('query');
                if (providerObj !== null && providerObj !== undefined) {
                  this.searchedProvider = providerObj;
                }
                const selectedProvider = JSON.parse(localStorage.getItem('selectedProvider'));
                localStorage.removeItem('selectedProvider');
                if (selectedProvider) {
                  if (this.formData.recentProvider) {
                    this.checkRecent();
                    this.selectProvider(selectedProvider);
                  } else if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
                    this.filterResults(this.sortIcon);
                    this.selectProvider(selectedProvider);
                  } else {
                    this.filterProviders();
                    this.selectProvider(selectedProvider);

                  }
                }
              }
          });
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
    this.searchedProvider = {};
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      this.dtTrigger.next();
    }).catch(error => {
      console.error('Error getting providers. ' + error);
    });
  }

  // Selected Requesting Provider
  selectProvider(provider) {
    localStorage.setItem('selectedProvider', JSON.stringify(provider));
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

  validateForm() {
    // Payer, Provider and Date Range are required fields to submit the form

    // If both date fields should be filled with valid values
    if (this.utils.isValid(this.fromDate) || this.utils.isValid(this.toDate)) {
      if (!(this.utils.isValid(this.fromDate) && this.utils.isValid(this.toDate))) {
        return true;
      }
    }

    // If payer, Provider and date range are not selected the submit button will be disabled
    if (this.utils.isValid(this.fromDate) &&
        this.utils.isValid(this.toDate) &&
        this.utils.isValid(this.model.payer.payerId) &&
        !isNullOrUndefined(this.model.payerProvider)) {
      return !this.utils.isValid(this.model.payerProvider.id);
    }
    return true;
  }

  saveInquiry() {
    this.loaderService.display(true);
    // formatting To and From dates
    this.model.inquiryDateRange.toDate = this.utils.getInquiryDateTo(this.toDate);
    this.model.inquiryDateRange.fromDate = this.utils.getInquiryDateFrom(this.fromDate);
    if (!isNullOrUndefined(this.model.inquirySummaryFilter)) {
      if (!isNullOrUndefined(this.model.inquirySummaryFilter.claimId)) {
      this.model.inquirySummaryFilter.claimId = this.model.inquirySummaryFilter.claimId.trim();
    }}
    if (!isNullOrUndefined(this.model.patient.memberId)) {
      this.model.patient.memberId = this.model.patient.memberId.trim();
    }
    if (!isNullOrUndefined(this.model.patient.lastName)) {
      this.model.patient.lastName = this.model.patient.lastName.trim();
    }
    // Provider inquiry Summary Filter are not added then remove this object
    // if (Object.keys(this.model.inquirySummaryFilter).length > 0) {
    //   this.inquiryFilter = this.model.inquirySummaryFilter;
    // }
    const pageInformation =  {currentPage : this.currentOffset, pageSize: this.pageSize};
    const providerObject: any = {
      payer: this.model.payer,
      patient: this.model.patient,
      payerProvider: this.model.payerProvider,
      toDate: moment(this.model.inquiryDateRange.toDate).toISOString() ,
      fromDate: moment(this.model.inquiryDateRange.fromDate).toISOString() ,
      currentUserOnly: this.model.currentUserOnly,
      inquiryType: this.model.inquirySummaryFilter.inquiryType,
      inquiryStatus: this.model.inquirySummaryFilter.inquiryStatus,
      inquiryId: this.model.inquirySummaryFilter.inquiryId,
    };
    if (this.model.inquirySummaryFilter.claimId !== null && this.model.inquirySummaryFilter.claimId !== undefined &&
        this.model.inquirySummaryFilter.claimId !== '') {
      providerObject.claimId = this.model.inquirySummaryFilter.claimId;
    }
    localStorage.setItem('InquiryData', JSON.stringify(providerObject));
    localStorage.setItem('query', JSON.stringify(this.searchedProvider));
    localStorage.setItem('pageInfo', JSON.stringify(pageInformation));
    // Call SUBMIT PROVIDER INQUIRY SUMMARY Service
    this.providerService.submitProviderInquiryStatus(providerObject)
        .takeUntil(this.unSubscribe).subscribe(
        data => {

          this.loaderService.display(false);
          if (data.length === 0) {
            // 0 records, user should be notified 0 matching records and
            // returned to this form with field values still populated
            this.alertService.error('0 matching records found');

          } else if (data.length === 1) {
            // 1 record, user should be re-directed to the Provider Inquiry response record details page
            localStorage.setItem('providerData', JSON.stringify(providerObject));
            const singleResponse: any = {};
            singleResponse.payer = {
                'payerId': providerObject.payer.payerId,
                'name': providerObject.payer.name
            };
            singleResponse.inquiryId = data[0].inquiryId;

            this.providerService.getProviderSummaryDetails(singleResponse)
                .takeUntil(this.unSubscribe).subscribe(
                providerSummaryResult => {
                    const dataArray = [];
                    dataArray.push(providerSummaryResult);
                    this.dataService.setSingleResponseDetail(dataArray);
                    this.route.navigate(['/client/provider-inquiry/detail']);
                    this.loaderService.display(false);
                }, error => {
                  this.loaderService.display(false);
                  this.alertService.error(error.error.errors[0].endUserMessage);
                }
            );
            // this.route.navigate(['/client/provider-inquiry/detail']);
            // this.dataService.setSingleResponseDetail(data);

          } else if (data.length > 1) {
            this.dataService.setFormDataFromInquiryForm(providerObject);
            // > 1 record, user should be re-directed the Provider Inquiry response record list page
            this.navigateToMultipleResponsePage(data);
          }
        }, error => {

          this.loaderService.display(false);
          // if (error.status === 500 || error.status === 504) {
          //   this.alertService.error('Something went wrong with your request. Please try again.');
          // } else {
            this.alertService.error(error.error.errors[0].endUserMessage);
         // }
        }
    );
  }

  navigateToMultipleResponsePage(multipleData) {
    this.dataService.setMultipleResponse(multipleData);
    this.route.navigate(['/client/provider-inquiry/multi-response']);
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

    this.sharedService.getRequestingProviders(this.model.payer.payerId, this.recentProvider,
        groupRequest).takeUntil(this.unSubscribe).subscribe(
        data => {
          this.providerList = data.results;
          // this.cdr.detectChanges();

          this.totalRecords =  data.totalCount;
          if ( this.totalRecords % this.pageSize === 0 ) {
            this.totalPages =  this.totalRecords / this.pageSize ;
          } else {
            this.totalPages = Math.floor(  this.totalRecords / this.pageSize) + 1;
          }

          this.nextClass = ((this.totalPages === (this.currentOffset + 1)) || this.totalPages === 0) ? 'next disabled' : 'next';
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
