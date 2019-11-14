import {
  Component, OnInit, ViewEncapsulation, ViewChild, ViewChildren,
  QueryList, AfterViewInit, NgZone, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, HostListener
} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Subject';
import { ReferralRequestService, UserSessionService, AlertService, PayerDetailsService,
  LoaderService, UtilsService, DataSharingService, SharedService } from '@services/index';
import { Page, SortFields, DataRequest } from '@models/index';
import { Router } from '@angular/router';
import * as moment from 'moment';
import {isNull, isNullOrUndefined} from 'util';
import * as _ from 'lodash';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
declare function isNumberKey(e, target): any;
declare function isValidDate(e): any;
declare function isNumeric(e): any;
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-referral-request-form',
  templateUrl: './referral-request-form.component.html',
  styleUrls: ['./referral-request-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class ReferralRequestFormComponent implements OnInit, AfterViewInit, OnDestroy {
  // variables for submit button and data tables
  @ViewChild('submitBtn') btn: any;
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  dtOptions: DataTables.Settings = {};
  dtOptions2: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTriggerServicing: Subject<any> = new Subject();

  // model
  model: any = {
    payer: {},
    requestingProvider: {},
    servicingProvider: {},
    subscriber: {},
    primaryDiagnosis: '',
    referralInformation: {},
    relatedCauses: {}
  };
  searchedProvider: any = {};
  servicingProviderSearchParams: any = {};
  // permission checking and setting up form as per permissionlist
  userRole: string;
  userInfo: any = {};
  permissionId = '';
  permissionName = 'Referral Request';
  showMessageField: boolean;
  showAccountNumber: boolean;
  memberOrSubscriber: String = 'Member';
  // lists of data object across the page and related variables
  facilityCodes = [];
  states = [];
  payerList = [];
  providerList = [];
  recentProvider: boolean;
  recentServicingProvider = false;
  showProviderMessage = false;
  showServicingProviderMessage = false;
  // date handling variables
  maxDate: Date;
  minDate: Date;
  minStartAccidentDate: Date;
  dateMsg = null;
  startDateMsg = null;
  accidentDateMsg = null;
  isRequestingProvider = false;

  // server side pagination for requesting providers
  pageSize = 100;
  currentOffset = 0;
  totalPages = 0;
  preClass = 'pre disabled';
  nextClass = 'next';
  keyword = '';
  totalRecords = 0;
  // server side pagination for servicing providers
  totalServicingProviders = 0;
  currentServicingProviderPage = 0;
  servicingProvidersPageSize = 100;
  servicingProviderList = [];
  totalServicingProvidersPages = 0;
  servicingProviderOffset = 0;
  preProviderClass = 'pre disabled';
  nextProviderClass = 'next';
// autocomplete for search diagnosis code
  txtQuery: string;
  txtQueryChanged: Subject<string> = new Subject<string>();
  searchResult: any = [];

  memberError = '';
  countryList: any = [];
  inquiryData: any;
  showDiagnosisError = false;
  diagnosisClass = 'input-field';
  diagnosisText = '';
  private unSubscribe = new Subject();
  tableClass = 'common-datatable grid-table table-striped';
  tabClass = 'tabs-main-container';
  searchedRequestingProvider: any = {};
  searchParams: any = {};
  practiceOfficeUserMode = false;
  adxTransactionId = '';
  selectedTabIndex = 0;
  servicingSelectedTabIndex = 0;
  durationArray = [];
  tipURL: any;
  isstateSelected = false;
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

  constructor(private referralService: ReferralRequestService,
              private payerService: PayerDetailsService,
              private userSessionService: UserSessionService,
              private alertService: AlertService,
              private loaderService: LoaderService,
              private route: Router,
              private utils: UtilsService,
              private dataService: DataSharingService,
              private sharedService: SharedService,
              private zone: NgZone,
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

// page hooks for init and afterviewinit starts
  ngOnInit() {
    this.loaderService.display(true);

    this.minDate = new Date(1900, 0, 1); // user cannot select date before 1900
    this.maxDate = new Date(); // user cannot select future date for DOB
    const current = new Date();
    const finalDate = new Date(current.toDateString());
    this.model.referralInformation.startDate = finalDate;

    this.minStartAccidentDate = finalDate; // new Date(current.getFullYear(), current.getMonth(), current.getUTCDate());
    this.model.referralInformation.referralType = '1';
   // this.model.referralInformation.duration = '1';
    this.model.referralInformation.facilityCode = '11';

    this.dataService.getFormDataFromInquiryForm.takeUntil(this.unSubscribe).subscribe(
        data => {

          this.inquiryData = data;
          if (this.inquiryData.recentProvider) {
            this.selectedTabIndex = 1;
          }
          if (this.inquiryData.recentServicingProvider) {
            this.servicingSelectedTabIndex = 1;
          }
          if (this.inquiryData.txtQuery) {
            this.txtQuery = this.inquiryData.txtQuery;
            const index = this.txtQuery.lastIndexOf('(') + 1;
            this.model.primaryDiagnosis = this.txtQuery.substring( index, this.txtQuery.length - 1);
          }
          if (this.inquiryData.pageInfo) {
            this.pageSize = this.inquiryData.pageInfo.pageSize;
            this.currentOffset = this.inquiryData.pageInfo.currentPage;
            this.servicingProvidersPageSize = this.inquiryData.pageInfo.servicingPageSize;
            this.servicingProviderOffset = this.inquiryData.pageInfo.servicingPage;
          }
        });
    // Get the permission List from local storage and fetch/set the specific permission Id for this page
    this.permissionId = this.utils.setPermissionIdInLocalStorage(this.permissionName);
    this.adxTransactionId = this.utils.getAdxId(this.permissionName);
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

    this.dtOptions2 = {
      retrieve: true,
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
    // fetch service codes
    this.getServiceCodes();
    // fetch countries
    this.fetchCoutries();
    // fetch state list
    // this.getStates();
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
    this.dtTriggerServicing.next();
    setTimeout(function () {
      const myElement = <HTMLElement>document.getElementsByClassName('ng-star-inserted highlighted')[0];
      if (myElement) {
        const topPos = myElement.offsetTop;
        document.getElementsByClassName('dataTables_scrollBody')[0].scrollTop = topPos;
      }
      const myElement2 = <HTMLElement>document.getElementsByClassName('ng-star-inserted highlighted')[1];
      if (myElement2) {
        const topPos2 = myElement2.offsetTop;
        document.getElementsByClassName('dataTables_scrollBody')[1].scrollTop = topPos2;
      }
    } , 2500);
  }

  // get service codes from rest
  getServiceCodes() {
    this.referralService.getServiceCodes()
        .takeUntil(this.unSubscribe).subscribe(data => {
      this.facilityCodes = data;
    });

  }
// get states
  getStates() {
    this.referralService.getStates().takeUntil(this.unSubscribe).subscribe(
        data => {
          this.states = data;
          this.cdr.detectChanges();

        },
        error => {
          this.alertService.error(error.error.errors[0].endUserMessage);
        }
    );
  }
// page hooks for init and afterviewinit ends

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
          // this.cdr.detectChanges();
          this.payerList.forEach(obj => {
            if ( obj.payerId === this.inquiryData.payer) {
              if (this.inquiryData.payer) {
                this.model.userPayer = this.inquiryData.payer;
                this.updatePayer(this.inquiryData.payer);
              }
              if (this.inquiryData.searchParams) {
                this.searchedRequestingProvider = this.inquiryData.searchParams;
                const obR = this.inquiryData.searchParams;
                if (obR.postalCode) {
                  this.searchedRequestingProvider.serviceZip = obR.postalCode;
                }
                if (obR.state) {
                  this.searchedRequestingProvider.serviceState = obR.state;
                }
                if (obR.city ) {
                  this.searchedRequestingProvider.serviceCity = obR.city;
                }
                if (obR.address) {
                  this.searchedRequestingProvider.serviceAddressLine1 = obR.address;
                }
              }
              if (this.inquiryData.servicingProviderSearchParams) {
                this.searchedProvider = this.inquiryData.servicingProviderSearchParams;
                const ObS = this.inquiryData.servicingProviderSearchParams;
                if (ObS.postalCode) {
                  this.searchedProvider.serviceZip = ObS.postalCode;
                }
                if (ObS.state) {
                  this.searchedProvider.serviceState = ObS.state;
                }
                if (ObS.city ) {
                  this.searchedProvider.serviceCity = ObS.city;
                }
                if (ObS.address) {
                  this.searchedProvider.serviceAddressLine1 = ObS.address;
                }
              }
              this.model.diagnosisInfo  = false;
              if (this.inquiryData.payerProvider) {
                if (this.inquiryData.recentProvider) {
                  this.checkRecent();
                  this.selectProvider(this.inquiryData.payerProvider);
                } else if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
                  this.filterResults();
                  this.selectProvider(this.inquiryData.payerProvider);
                } else {
                  this.filterRequestingProviders();
                  this.selectProvider(this.inquiryData.payerProvider);
                }
              }
              if (this.inquiryData.servicingProvider) {
                const contextualRef = this;
                if (this.inquiryData.recentServicingProvider) {
                  setTimeout(function () {
                    contextualRef.checkRecentServicingProviders();
                    contextualRef.selectServicingProvider(contextualRef.inquiryData.servicingProvider);
                  }, 600);
                } else if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {

                  setTimeout(function () {
                        contextualRef.loaderService.display(true);
                        contextualRef.filterProviders();
                        contextualRef.selectServicingProvider(contextualRef.inquiryData.servicingProvider);
                      }, 600
                  );

                } else {
                  setTimeout(function () {
                    contextualRef.getServicingProviders();
                    contextualRef.selectServicingProvider(contextualRef.inquiryData.servicingProvider);
                  }, 600);
                }
              }
              if (this.inquiryData.subscriber) {
                this.model.subscriber.memberNo = this.inquiryData.subscriber.memberNo;
                this.model.subscriber.firstName = this.inquiryData.subscriber.firstName;
                this.model.subscriber.lastName = this.inquiryData.subscriber.lastName;
                this.model.subscriber.dateOfBirth = this.inquiryData.subscriber.dateOfBirth;
                this.model.subscriber.patientAccountNo = this.inquiryData.subscriber.patientAccountNo;
              }
              if (this.inquiryData.referralRequestInformation) {
                const referralRequest = this.inquiryData.referralRequestInformation;
                this.model.diagnosisInfo = referralRequest.primaryDiagnosis;
                this.model.referralInformation.referralType = referralRequest.serviceReviewInformation.serviceTypeCode;
                this.model.referralInformation.previousCertificationNo = referralRequest.previousCertificationNo;
                this.model.referralInformation.startDate = this.inquiryData.startDate;
                this.model.referralInformation.duration = this.inquiryData.duration;
                this.model.referralInformation.numberOfVisits = referralRequest.numberOfVisits;
                this.model.referralInformation.facilityCode = referralRequest.serviceReviewInformation.facilityTypeCode;
                this.model.referralInformation.message = referralRequest.message;
                this.model.relatedCauses.type = referralRequest.serviceReviewInformation.relatedCauseCode;
                this.model.relatedCauses.country = referralRequest.serviceReviewInformation.countryCode;
                this.model.relatedCauses.state = referralRequest.serviceReviewInformation.stateCode;
                // this.model.relatedCauses.accidentDate = referralRequest.serviceReviewInformation.accidentDate;
               if (referralRequest.serviceReviewInformation.accidentDate !== undefined) {
                 this.model.relatedCauses.accidentDate = moment(referralRequest.serviceReviewInformation.accidentDate).toISOString();
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
  // selected payer
  updatePayer(payerId) {
    this.isRequestingProvider = true;
    this.model.requestingProvider = null;
    this.model.servicingProvider = null;
    this.showProviderMessage = false;
    this.showServicingProviderMessage = false;
    this.model.payer.payerId = payerId;
    this.payerList.forEach(obj => {
      if ( obj.payerId === this.model.payer.payerId) {
        this.model.payer.name = obj.name;
      }
    });
    this.getPermissionSettings();
    if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
      this.getRequestingProviders();
    }

    if (!this.inquiryData || this.inquiryData.payer !== payerId) {
      this.servicingProviderList.splice(0, this.servicingProviderList.length);
      this.searchedRequestingProvider = {};
      this.searchedProvider = {};
      this.inquiryData.payerProvider = {};
      this.inquiryData.payer = {};
      this.providerList = [];
      this.dtElements.forEach((dtElement) => {
        if (dtElement.dtInstance !== undefined) {
          dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            // Destroy the table first
            dtInstance.destroy();
            // Call the dtTrigger to rerender again
            dtElement.dtTrigger.next();

          });
        }

      });
    }
  }

  // load permission settings of selected payer and update page accordingly
  getPermissionSettings() {
    this.durationArray = [];
    this.sharedService.getPermissionSetting(this.model.payer.payerId, this.adxTransactionId)
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          this.loaderService.display(true);

          data.onOffConfigs.forEach(config => {
            if (config.configName === 'Member Information Settings') {
              this.memberOrSubscriber = config.value === 'ACTIVE' ? 'Member' : 'Subscriber';
            }
            if (config.configName === 'Patient Account #') {
              this.showAccountNumber = config.value === 'ACTIVE';
            }
            if (config.configName === 'Message field') {
              this.showMessageField = config.value === 'ACTIVE';
            }
          });
          const dayConfigs = data.onOffConfigs.filter(x => x.configName === 'Available Days' );
           if (dayConfigs.length > 0 ) {
               const config = dayConfigs[0];
               for (let i = 0; i < config.value.length; i++) {
                 {
                   if (config.value[i] === '90') {
                     this.durationArray.push({value : '13' , viewValue: config.value[i] + ' Days'});
                   } else {
                     this.durationArray.push({value : '14' , viewValue: config.value[i] + ' Days'});
                   }

                 }
               }
           }
          const monthConfigs = data.onOffConfigs.filter(x => x.configName === 'Available Months' );
           if (monthConfigs.length > 0) {
             const config = monthConfigs[0];
               if (config.value.items !== null && config.value.items !== undefined) {
                 for (let i = 0; i < config.value.items.length; i++) {
                   if (config.value.items[i] === '1') {
                     this.durationArray.push({value : config.value.items[i] , viewValue: config.value.items[i] + ' Month'});
                   } else {
                     this.durationArray.push({value : config.value.items[i] , viewValue: config.value.items[i] + ' Months'});
                   }
                 }
               } else {
                 for (let i = 0; i < config.value.length; i++) {
                   if (config.value[i] === '1') {
                     this.durationArray.push({value : config.value[i] , viewValue: config.value[i] + ' Month'});
                   } else {
                     this.durationArray.push({value : config.value[i] , viewValue: config.value[i] + ' Months'});
                   }
                 }
               }
           }
          if (this.durationArray.length > 0 ) {
            for (let i = 0 ; i < this.durationArray.length; i++) {
              if (this.durationArray[i].value === '13' || this.durationArray[i].value === '1') {
                this.model.referralInformation.duration = this.durationArray[i].value;
                break;
              }
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
      this.totalRecords = 0;
      this.filterResults();
      this.loaderService.display(false);


    }

  }
  // If payers are recent
  checkRecent() {
    this.model.requestingProvider = null;
    this.recentProvider = !this.recentProvider;
    if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
      this.getRequestingProviders();
    } else {
      this.filterProviders();
      this.filterRequestingProviders();
    }
  }

  // Selected Requesting Provider
  selectProvider(provider) {
    this.showProviderMessage = false;
    this.model.requestingProvider = isNullOrUndefined(this.model.requestingProvider) ? {} : this.model.requestingProvider;
    this.model.requestingProvider.address =
        isNullOrUndefined(this.model.requestingProvider.address) ? {} : this.model.requestingProvider.address;

    this.model.requestingProvider.npi = provider.npi;
    this.model.requestingProvider.taxId = provider.taxId;
    this.model.requestingProvider.id = provider.providerId;
    this.model.requestingProvider.lastName = provider.lastName;
    this.model.requestingProvider.taxonomy = provider.taxonomy;
    this.model.requestingProvider.firstName  = this.utils.isValid(provider.firstName) ?
        provider.firstName : null;
    // Payer provider address
    this.model.requestingProvider.address.city = provider.serviceCity;
    this.model.requestingProvider.address.state = provider.serviceState;
    this.model.requestingProvider.address.zipCode = provider.serviceZip;
    this.model.requestingProvider.address.line1 = provider.serviceAddressLine1;
    this.model.requestingProvider.address.line2 = provider.serviceAddressLine2;
  }

  // Pagination Code for payer providers starts
  updatePageSize(event) {
    this.pageSize = event.value;
    this.currentOffset = 0;
    if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
      this.filterResults();
    } else {
      this.filterRequestingProviders();
    }
  }

  nextPage(cls) {
    if (cls === 'next disabled') {
      return false;
    }
    this.model.requestingProvider = null;
    this.currentOffset = this.currentOffset + 1;
    if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
      this.filterResults();
    } else {
      this.filterRequestingProviders();
    }
  }

  prevPage(cls) {
    if (cls === 'pre disabled') {
      return false;
    }
    this.model.requestingProvider = null;
    this.currentOffset = this.currentOffset - 1;
    if (this.userRole === 'PRACTICE_OFFICE_USER' || this.practiceOfficeUserMode) {
      this.filterResults();
    } else {
      this.filterRequestingProviders();
    }
  }


  filterResults() {
    this.loaderService.display(true);

    const sortFields: SortFields  = {
      fieldName: 'lastName',
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
        //  if (!this.inquiryData || this.inquiryData.payer !== this.model.payer.payerId) {
            this.dtElements.forEach((dtElement) => {
              if (dtElement.dtInstance !== undefined) {
                dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                  // Destroy the table first
                  dtInstance.destroy();
                  // Call the dtTrigger to rerender again
                  dtElement.dtTrigger.next();

                });
              }

            });
         // }
          this.loaderService.display(false);
        },
        error => {
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        }
    );
  }

  searchProviders(event) {
    this.model.requestingProvider = null;
    if (event.target.value.length > 0 ) {
      if (event.key.toLowerCase() === 'enter') {
        this.keyword = event.target.value;
        this.filterResults();
      }

    } else {
      this.keyword = '';
      this.filterResults();
    }
  }
  // Search provider by button
  searchProvidersByClick() {
    if (this.keyword !== '') {
      this.model.payerProvider = null;
      this.filterResults();
    }
  }

  // Pagination Code for payer providers Ends  -------------------------------------

  // servicing providers portion start
  checkRecentServicingProviders() {
    this.model.servicingProvider = null;
    this.recentServicingProvider = !this.recentServicingProvider;
    this.getServicingProviders();

  }

  getServicingProviders() {
    if (this.model.payer.payerId !== undefined) {

      this.loaderService.display(true);
      this.totalServicingProviders = 0;
      this.currentServicingProviderPage = 0;
      this.filterProviders();
      this.loaderService.display(false);


    }

  }


  nextProviderPage(cls) {
    if (cls === 'next disabled') {
      return false;
    }
    this.model.servicingProvider = null;
    this.servicingProviderOffset = this.servicingProviderOffset + 1;
    this.preProviderClass = (this.servicingProviderOffset === 0) ? 'pre disabled' : 'pre';
    this.nextProviderClass = (this.servicingProviderOffset < this.totalServicingProvidersPages) ? 'next' : 'next disabled';

    this.filterProviders();
  }

  prevProviderPage(cls) {
    if (cls === 'pre disabled') {
      return false;
    }
    this.model.servicingProvider = null;
    this.servicingProviderOffset = this.servicingProviderOffset - 1;
    this.preProviderClass = (this.servicingProviderOffset === 0) ? 'pre disabled' : 'pre';

    this.nextProviderClass = (this.servicingProviderOffset < this.totalServicingProvidersPages) ? 'next' : 'next disabled';
    this.filterProviders();
  }
// fetch servicing providers
  filterProviders() {
    this.loaderService.display(true);

    const sortFields: SortFields  = {
      fieldName: 'lastName',
      sortOrder: 'ASC'
    };
    const page: Page = {
      offSet : this.servicingProviderOffset,
      size : this.servicingProvidersPageSize
    };
    const findParameter: DataRequest = {
      keyword : '',
      sortField : {
        page : page,
        sortField: sortFields
      }
    };

    const servicingProvider: any =  {
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
    this.servicingProviderSearchParams = servicingProvider;

    const requestObj: any = {'findParameter': findParameter , 'provider': servicingProvider  };
    this.payerService.getServicingProviders(this.model.payer.payerId, this.recentServicingProvider, this.practiceOfficeUserMode, requestObj)
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          this.servicingProviderList = data.results;
          // this.cdr.detectChanges();

          this.totalServicingProviders =  data.totalCount;
          if ( this.totalServicingProviders % this.servicingProvidersPageSize === 0 ) {
            this.totalServicingProvidersPages =  this.totalServicingProviders / this.servicingProvidersPageSize ;
          } else {
            this.totalServicingProvidersPages = Math.floor(  this.totalServicingProviders / this.servicingProvidersPageSize) + 1;
          }

          this.nextProviderClass = (this.totalServicingProvidersPages === (this.servicingProviderOffset + 1)) ? 'next disabled' : 'next';
          if (this.totalServicingProvidersPages === 0) {
            this.nextProviderClass = 'next disabled';
          }
         // if (!this.inquiryData || this.inquiryData.payer !== this.model.payer.payerId) {
            this.dtElements.forEach((dtElement) => {
              if (dtElement.dtInstance !== undefined) {
                dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                  // Destroy the table first
                  dtInstance.destroy();
                  // Call the dtTrigger to rerender again
                  dtElement.dtTrigger.next();

                });
              }

            });
        //  }
          this.loaderService.display(false);
        },
        error => {
          this.loaderService.display(false);
          if (error.error.errors[0].endUserMessage === 'Submitted Payer ID/s: undefined is invalid, ' +
              'please submit a properly formatted Payer ID/s.') {
            this.alertService.error('Please select a payer for provider.');
          } else {
            this.alertService.error(error.error.errors[0].endUserMessage);
          }
        }
    );
  }

// trigger page size update on servicing provider
  updateProviderPageSize(event) {
    this.servicingProvidersPageSize = event.value;
    this.currentServicingProviderPage = 0;
    this.preProviderClass = 'pre disabled';
    this.nextProviderClass = 'next';
    this.filterProviders();
  }
  // select servicing provider
  selectServicingProvider(provider) {
    this.showServicingProviderMessage = false;
    this.model.servicingProvider = isNullOrUndefined(this.model.servicingProvider) ? {} : this.model.servicingProvider;
    this.model.servicingProvider.address =
        isNullOrUndefined(this.model.servicingProvider.address) ? {} : this.model.servicingProvider.address;

    this.model.servicingProvider.npi = provider.npi;
    this.model.servicingProvider.taxId = provider.taxId;
    this.model.servicingProvider.id = provider.providerId;
    this.model.servicingProvider.lastName = provider.lastName;
    this.model.servicingProvider.taxonomy = provider.taxonomy;
    this.model.servicingProvider.firstName = this.utils.isValid(provider.firstName) ?
        provider.firstName : null;
    // Payer provider address
    this.model.servicingProvider.address.city = provider.serviceCity;
    this.model.servicingProvider.address.state = provider.serviceState;
    this.model.servicingProvider.address.zipCode = provider.serviceZip;
    this.model.servicingProvider.address.line1 = provider.serviceAddressLine1;
    this.model.servicingProvider.address.line2 = provider.serviceAddressLine2;
  }

  searchServicingProviders(event) {
    if (event.keyCode === 13 || event.target.value === '') {
      this.model.servicingProvider = null;
      this.filterProviders();
    }
  }
  // end servicing providers portion ends
  // date validation starts
  handledate(e) {
    return isNumberKey(e, e.target);
  }

  // Validate date
  validateDate(e) {
    this.dateMsg = null;
    if (e.target.value !== '') {
      if (isValidDate(e.target.value)) {
        if (new Date(e.target.value).getTime() < new Date(this.minDate).getTime()) {
          this.dateMsg = 'DOB cannot be less than 01/01/1900 ';
        } else if (new Date(e.target.value).getTime() > new Date().getTime()) {
          this.dateMsg = 'DOB cannot be future date';
        }
      } else {
        this.dateMsg = 'Invalid date';
      }
    } else {
      this.dateMsg = null;
    }



  }
// validate start date
  validateStartDate(e) {
    this.startDateMsg = null;
    this.startDateMsg =  (e.target.value !== '' && !isValidDate(e.target.value)) ? 'Invalid date' : null;
  }

// validate accident date
  validateAccidentDate(e) {
    this.accidentDateMsg = null;
    if (e.target.value !== '') {
      if (isValidDate(e.target.value)) {
        if (new Date(e.target.value).getTime() > new Date().getTime()) {
          this.accidentDateMsg = 'Accident Date cannot be future date';
        }
      } else {
        this.accidentDateMsg = 'Invalid date';
      }
    } else {
      this.accidentDateMsg = null;
    }
  }

  // handle all visits
  handleVisits(e) {
    return isNumeric(e);
  }

  // validates form
  validateForm() {
    let i = 0;
    if (isNullOrUndefined(this.model.payer)  || _.isEmpty(this.model.payer)) {
      return true;
    } else {
      if (isNullOrUndefined(this.model.requestingProvider)  || _.isEmpty(this.model.requestingProvider)) {
        return true;
      }
      if (isNullOrUndefined(this.model.servicingProvider)  || _.isEmpty(this.model.servicingProvider)) {
        return true;
      }
    }

    if (this.utils.isValid(this.model.subscriber.memberNo) && this.model.subscriber.memberNo.trim().length > 0 ||
        (this.utils.isValid(this.model.subscriber.firstName) && this.utils.isValid(this.model.subscriber.lastName)) ) {
      i = i + 1;
    }
    // if (this.utils.isValid(this.model.subscriber.firstName) || this.utils.isValid(this.model.subscriber.lastName)) {
    //   i = i + 1;
    // }
    if (this.utils.isValid(this.model.subscriber.dateOfBirth )) {
      i = i + 1;
    }

    if (i < 2 ) {
      this.memberError = 'Please enter either Member # and DOB or Name (First & Last) and DOB';
      return true;
    } else {
      this.memberError = '';
    }

    if (this.model.relatedCauses.type === 'AA') {
      if (isNullOrUndefined(this.model.relatedCauses.country)) {
        return true;
      } else if (this.model.relatedCauses.country === 'USA' && isNullOrUndefined(this.model.relatedCauses.state)) {
        return true;
      } else {
        this.isstateSelected = true;
      }
    }

    return !this.model.primaryDiagnosis;

  }
  // triggers next on key press
  onFieldChange(query: string) {
    this.txtQueryChanged.next(query);
  }

  // search for ICD-10 code
  onSearchChange(searchValue: string) {
    if (searchValue !== '' && searchValue.length > 2) {
      this.referralService.search_word(searchValue).takeUntil(this.unSubscribe).subscribe(response => {
        this.searchResult = response;
      });
    } else {
      this.model.primaryDiagnosis = null;
      this.searchResult = null;
    }

  }

  // HNP-5432
  verifyProvider() {

    if (isNullOrUndefined(this.model.requestingProvider)) {
      this.showProviderMessage = true;
    }

    if (isNullOrUndefined(this.model.servicingProvider)) {
      this.showServicingProviderMessage = true;
    }
  }

// get diagnostic code id after selection
  updateDiagnosticCode(event) {
    this.diagnosisText = event.option.value;
    const index = event.option.value.lastIndexOf('(') + 1;
    this.model.primaryDiagnosis = event.option.value.substring( index, event.option.value.length - 1);
    this.showDiagnosisError = false;
    this.diagnosisClass = 'input-field';
  }

  // submits the referral inquiry
  saveInquiry() {
    this.loaderService.display(true);
    const serviceReviewInformation: any = {};

    if (!_.isEmpty(this.model.referralInformation.referralType)) {
      serviceReviewInformation.serviceTypeCode = this.model.referralInformation.referralType;
    }
    if (!_.isEmpty(this.model.relatedCauses.type)) {
      serviceReviewInformation.relatedCauseCode = this.model.relatedCauses.type;
    }
    if (!_.isEmpty(this.model.relatedCauses.country)) {
      serviceReviewInformation.countryCode = this.model.relatedCauses.country;
    }
    if (!_.isEmpty(this.model.relatedCauses.state)) {
      serviceReviewInformation.stateCode = this.model.relatedCauses.state;
    }
    if (!_.isEmpty(this.model.referralInformation.facilityCode)) {
      serviceReviewInformation.facilityTypeCode = this.model.referralInformation.facilityCode;
    }
    if (this.utils.isValid(this.model.relatedCauses.accidentDate)) {
      serviceReviewInformation.accidentDate = moment(this.model.relatedCauses.accidentDate).format('YYYY-MM-DD') ;
    }
    const refferalRequestInformation: any = {};
    refferalRequestInformation.serviceReviewInformation = serviceReviewInformation;
    if (!_.isEmpty(this.model.referralInformation.message)) {
      refferalRequestInformation.message = this.model.referralInformation.message;
    }
    if (!_.isEmpty(this.model.referralInformation.numberOfVisits)) {
      refferalRequestInformation.numberOfVisits = this.model.referralInformation.numberOfVisits;
    }
    if (!_.isEmpty(this.model.referralInformation.previousCertificationNo)) {
      refferalRequestInformation.previousCertificationNo = this.model.referralInformation.previousCertificationNo.trim();
    }
    if (!_.isEmpty(this.model.primaryDiagnosis)) {
      refferalRequestInformation.primaryDiagnosis = this.model.primaryDiagnosis.trim();
    }
    if (!_.isEmpty(this.model.subscriber.memberNo)) {
      this.model.subscriber.memberNo = this.model.subscriber.memberNo.trim();
    }
    if (!_.isEmpty(this.model.subscriber.patientAccountNo)) {
      this.model.subscriber.patientAccountNo = this.model.subscriber.patientAccountNo.trim();
    }
    if (!_.isEmpty(this.model.subscriber.firstName)) {
      this.model.subscriber.firstName = this.model.subscriber.firstName.trim();
    }
    if (!_.isEmpty(this.model.subscriber.lastName)) {
      this.model.subscriber.lastName = this.model.subscriber.lastName.trim();
    }


    // Prepare Referral Information Event Dates (start Date - End Date)
    if (this.utils.isValid(this.model.referralInformation.startDate) && !_.isEmpty(this.model.referralInformation.duration)) {
      const startDate = new Date(moment(this.model.referralInformation.startDate).toISOString());
      let endDate;
      // If Duration set is in days then End Date = Start Date + duration (days)
      // otherwise End Date = Start Date + duration (months)

      if (this.model.referralInformation.duration === '13' || this.model.referralInformation.duration === '14') {
        const duration = this.model.referralInformation.duration === '13' ? 90 : 180;
        endDate = moment(startDate, 'YYYY-MM-DD').add(duration, 'd').format('YYYY-MM-DD');
      } else {
        endDate = moment( startDate.setMonth(startDate.getMonth() +
            parseInt(this.model.referralInformation.duration, 10))).format('YYYY-MM-DD');
      }
      // Assign dates to the event Date Range variable to be sent in request payload
      // refferalRequestInformation.eventDateRange = this.utils.getClaimServiceDate
      // (new Date(moment(this.model.referralInformation.startDate).format('YYYY-MM-DD')), new Date(endDate));
        refferalRequestInformation.eventDateRange = this.utils.getClaimServiceDate
        (new Date(moment(this.model.referralInformation.startDate).toISOString()), new Date(endDate));
    }

    const lastInquiry = 'referralInquiry';
    localStorage.setItem('lastInquiry', lastInquiry);
    // Re-assigning this variable, To Avoid empty fields from UI
    this.model.subscriber.patientAccountNo = this.utils.isValid(this.model.subscriber.patientAccountNo) ?
        this.model.subscriber.patientAccountNo : null;
    const referralRequest = {
      payer: this.model.payer,
      requestingProvider: this.model.requestingProvider,
      servicingProvider: this.model.servicingProvider,
      subscriber: this.model.subscriber,
      referralRequestInformation : refferalRequestInformation
    };
    const providerData = {
      providerId: this.model.requestingProvider.id,
      npi: this.model.requestingProvider.npi,
      taxId: this.model.requestingProvider.taxId,
      lastName: this.model.requestingProvider.lastName,
      taxonomy: this.model.requestingProvider.taxonomy,
      firstName: this.model.requestingProvider.firstName,
      serviceCity: this.model.requestingProvider.address.city,
      serviceState: this.model.requestingProvider.address.state,
      serviceZip: this.model.requestingProvider.address.zipCode,
      serviceAddressLine1: this.model.requestingProvider.address.line1,
      serviceAddressLine2: this.model.requestingProvider.address.line2
    };
    const serviceProviderData = {
      providerId: this.model.servicingProvider.id,
      npi: this.model.servicingProvider.npi,
      taxId: this.model.servicingProvider.taxId,
      lastName: this.model.servicingProvider.lastName,
      taxonomy: this.model.servicingProvider.taxonomy,
      firstName: this.model.servicingProvider.firstName,
      serviceCity: this.model.servicingProvider.address.city,
      serviceState: this.model.servicingProvider.address.state,
      serviceZip: this.model.servicingProvider.address.zipCode,
      serviceAddressLine1: this.model.servicingProvider.address.line1,
      serviceAddressLine2: this.model.servicingProvider.address.line2
    };
    const pageInformation =  {currentPage : this.currentOffset, pageSize: this.pageSize,
      servicingPageSize: this.servicingProvidersPageSize, servicingPage:  this.servicingProviderOffset };
    console.log(pageInformation);
    const referralRequestData = {
      payer: this.model.payer.payerId,
      payerProvider: providerData,
      servicingProvider: serviceProviderData,
      subscriber: this.model.subscriber,
      referralRequestInformation : refferalRequestInformation,
      servicingProviderSearchParams: this.servicingProviderSearchParams,
      requestingProvider: this.model.requestingProvider,
      serviceProvider: this.model.servicingProvider,
      searchParams: this.searchParams,
      recentProvider: this.recentProvider,
      recentServicingProvider: this.recentServicingProvider,
      startDate: this.model.referralInformation.startDate,
      duration: this.model.referralInformation.duration,
      txtQuery: this.txtQuery,
      pageInfo: pageInformation
    };
    this.dataService.setFormDataFromInquiryForm(referralRequestData);

    this.referralService.submitReferralInquiry(referralRequest).takeUntil(this.unSubscribe).subscribe(
        data => {
          const dataArray = [];
          dataArray.push(data);
          this.dataService.setSingleResponseDetail(dataArray);
          this.route.navigate(['/client/referral/response']);
          this.loaderService.display(false);
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

  setValueItem(item) {

    return item.description +  ' (' + item.code + ')';
  }

  fetchCoutries() {
    this.referralService.getCountryList().takeUntil(this.unSubscribe).subscribe(
        data => {
          this.countryList = data;
          if (this.inquiryData.referralRequestInformation) {
            const referralRequest = this.inquiryData.referralRequestInformation;
            if (referralRequest.serviceReviewInformation.countryCode !== undefined) {
                if (referralRequest.serviceReviewInformation.countryCode.toLowerCase() === 'can' ||
                    referralRequest.serviceReviewInformation.countryCode.toLowerCase() === 'usa' ||
                    referralRequest.serviceReviewInformation.countryCode.toLowerCase() === 'mex') {

                    const country = this.countryList.filter(x => x.code === referralRequest.serviceReviewInformation.countryCode)[0];

                    if (country !== null && country !== undefined) {

                        this.referralService.getStateByCountry(country.countryId).takeUntil(this.unSubscribe).subscribe(
                            res => {
                                this.states = res;
                                this.model.relatedCauses.state = referralRequest.serviceReviewInformation.stateCode;
                            },
                            error => {
                                this.alertService.error(error.error.errors[0].endUserMessage);
                            }
                        );
                    }
                }
            }

          }

          // this.cdr.detectChanges();
        },
        error => {
          this.alertService.error(error.error.errors[0].endUserMessage);
        }
    );
  }

  updateStateList(event) {


    this.isstateSelected = false;
    this.model.relatedCauses.state = null;
    if (event.value.toLowerCase() === 'can' || event.value.toLowerCase() === 'usa' || event.value.toLowerCase() === 'mex') {

      const country = this.countryList.filter(x => x.code === event.value)[0];
      if (country !== null && country !== undefined) {

        this.referralService.getStateByCountry(country.countryId).takeUntil(this.unSubscribe).subscribe(
            data => {
              this.states = data;

              this.cdr.detectChanges();
            },
            error => {
              this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
      }
    } else {
      this.states = [];
    }
  }

  getDurationValue(d) {
    console.log(d);
  }

  // unSubscribe the observables to avoid memory leaks
  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }

  searchProvidersByPayer(event) {
    if (event.keyCode === 13 || event.target.value === '') {
      this.model.requestingProvider = null;
      this.filterRequestingProviders();
    }
  }

  filterRequestingProviders() {
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
      'providerId': this.searchedRequestingProvider.providerId,
      'firstName': this.searchedRequestingProvider.firstName,
      'lastName': this.searchedRequestingProvider.lastName,
      'specialty': this.searchedRequestingProvider.specialty1,
      'taxId': this.searchedRequestingProvider.taxId,
      'npi': this.searchedRequestingProvider.npi,
      'address': this.searchedRequestingProvider.serviceAddressLine1,
      'city': this.searchedRequestingProvider.serviceCity,
      'state': this.searchedRequestingProvider.serviceState,
      'postalCode': this.searchedRequestingProvider.serviceZip,
      'taxonomy': this.searchedRequestingProvider.taxonomy,
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
          // if (!this.inquiryData || this.inquiryData.payer !== this.model.payer.payerId) {
            this.dtElements.forEach((dtElement) => {
              if (dtElement.dtInstance !== undefined) {
                dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                  // Destroy the table first
                  dtInstance.destroy();
                  // Call the dtTrigger to rerender again
                  dtElement.dtTrigger.next();

                });
              }

            });
          // }
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
    (encodeURI('http://wnyhealthenet.com/wp-content/uploads/2018/10/Tip-Sheet-Referral-Request.pdf'));
    window.open( this.tipURL.changingThisBreaksApplicationSecurity );
  }
  validateDiagnoses(e) {
    if (this.searchResult.length === 0 &&
        (this.model.primaryDiagnosis === null || this.model.primaryDiagnosis === undefined || this.model.primaryDiagnosis === '' ) ) {
      this.showDiagnosisError = true;
      this.diagnosisClass = 'input-field mat-form-field-invalid';
    } else {
      if (this.model.primaryDiagnosis === null || this.model.primaryDiagnosis === undefined || this.model.primaryDiagnosis === '' ) {
        this.showDiagnosisError = true;
        this.diagnosisClass = 'input-field mat-form-field-invalid';
      } else {
        if (this.txtQuery === this.diagnosisText) {
          this.showDiagnosisError = false;
          this.diagnosisClass = 'input-field';
        } else {
          this.showDiagnosisError = true;
          this.diagnosisClass = 'input-field mat-form-field-invalid';
          this.model.primaryDiagnosis = null;
        }

      }
    }
  }

  validateCountryState(event) {
    if (this.model.relatedCauses.type === 'AA') {
      this.model.relatedCauses.country = 'USA';
      this.updateStateList({value : 'USA'});
    }
  }
}
