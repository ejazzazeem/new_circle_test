import {
    Component, OnInit, ViewEncapsulation, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy,
    ViewChild
} from '@angular/core';
import { ReferralAuthService, AlertService, LoaderService, DataSharingService } from '@services/index';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import {DataTableDirective} from 'angular-datatables';


@Component({
  selector: 'app-referral-auth-details',
  templateUrl: './referral-auth-details.component.html',
  styleUrls: ['./referral-auth-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class ReferralAuthDetailsComponent implements OnInit, OnDestroy  {
    @ViewChild(DataTableDirective) dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};
    payerData: any;
    transactionData: any;
    subscriberData: any;
    dependentData: any;
    referralAuthData: any;
    requestingProviderData: any;
    referringProviderData: any;
    servicingProviderData: any;
    goOnTop = false;
    selectedTab = 1;
    categoryStatus: string;
    categoryCode: string;
    serviceLevelDetails: any;
    private unSubscribe = new Subject();

  constructor(
      private referralAuthService: ReferralAuthService,
      private alertService: AlertService,
      private loaderService: LoaderService,
      private dataService: DataSharingService,
      private router: Router,
      private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
      this.loaderService.display(true);
      this.showHideBackToTopButton(false, 1);

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
              emptyTable: 'No Service Level Details Found'
          },
          columnDefs: [
              {
                  'targets': [1, 2, 3, 4, 5, 6, 7],
                  'orderable': false,
              },
          ],
      };

      // uncomment this line to get mock data
      //   this.referralAuthService.getReferralAuthDetailsData().takeUntil(this.unSubscribe).subscribe(
       this.dataService.getSingleResponseDetail.takeUntil(this.unSubscribe).subscribe(
          data => {
              if (Object.keys(data).length === 0) {
                  this.router.navigate(['/client/referral-auth/inquiry']);
              } else {
                  // to activate the tab
                  this.showHideBackToTopButton(false, 1);
                  const response = [];
                  response.push(data);
                  this.cdr.detectChanges();
                  this.payerData = response[0].payer;
                  this.transactionData = response[0].transactionInfo;
                  this.requestingProviderData = response[0].requestingProvider;

                  if (response[0].referralIndexInList) {
                      const index = response[0].referralIndexInList;
                      this.referralAuthData = response[0].referralAuth[index];
                      this.subscriberData = response[0].referralAuth[index].subscriber;
                      this.dependentData = response[0].referralAuth[index].dependent ? response[0].referralAuth[index].dependent : null;
                  } else {
                      this.referralAuthData = response[0].referralAuth[0];
                      this.subscriberData = response[0].referralAuth[0].subscriber;
                      this.dependentData = response[0].referralAuth[0].dependent ? response[0].referralAuth[0].dependent : null;
                  }

                  if (this.referralAuthData.categoryCode && this.referralAuthData.categoryCode !== '') {
                      if (this.referralAuthData.categoryCode === 'SC' ||
                          this.referralAuthData.categoryCode === 'Specialty Care Review') {
                          this.categoryCode = 'Referral';
                          this.categoryStatus = 'Referral';
                      } else if (this.referralAuthData.categoryCode === 'AR' ||
                          this.referralAuthData.categoryCode === 'Admission Review' ||
                          this.referralAuthData.categoryCode === 'HS' ||
                          this.referralAuthData.categoryCode === 'Health Services Review') {
                          this.categoryCode = 'Pre-Authorization';
                          this.categoryStatus = 'Authorization';
                      }
                  }

                  this.referringProviderData = this.referralAuthData.referringProvider;
                  this.servicingProviderData = this.referralAuthData.servicingProvider;
                  this.serviceLevelDetails = this.referralAuthData.serviceLevelDetails;

                  if (this.serviceLevelDetails) {
                      this.serviceLevelDetails.forEach(serviceObj => {
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

                  // Referral Event Date Case Handled
                  if (this.referralAuthData.eventDate && this.referralAuthData.eventDate !== '') {
                      this.handleAuthReferralDates(this.referralAuthData.eventDate,
                          'eventDate', this.referralAuthData);

                  }
                  // Referral Admission Date Case Handled
                  if (this.referralAuthData.admissionDate && this.referralAuthData.admissionDate !== '') {
                      this.handleAuthReferralDates(this.referralAuthData.admissionDate,
                          'admissionDate', this.referralAuthData);

                  }
                  // Referral Discharge Date Case Handled
                  if (this.referralAuthData.dischargeDate && this.referralAuthData.dischargeDate !== '') {
                      this.handleAuthReferralDates(this.referralAuthData.dischargeDate,
                          'dischargeDate', this.referralAuthData);

                  }

                  // Referral Certification Issue Date Case Handled
                  if (this.referralAuthData.certificationIssueDate && this.referralAuthData.certificationIssueDate !== '') {
                      this.handleAuthReferralDates(this.referralAuthData.certificationIssueDate,
                          'certificationIssueDate', this.referralAuthData);

                  }

                  // Referral Certification Expiration Date Case Handled
                  if (this.referralAuthData.certificationExpirationDate && this.referralAuthData.certificationExpirationDate !== '') {
                      this.handleAuthReferralDates(this.referralAuthData.certificationExpirationDate,
                          'certificationExpirationDate', this.referralAuthData);

                  }

                  // Referral Service Review Request Date Case Handled
                  if (this.referralAuthData.servicesReviewRequestDate && this.referralAuthData.servicesReviewRequestDate !== '') {
                      this.handleAuthReferralDates(this.referralAuthData.servicesReviewRequestDate,
                          'servicesReviewRequestDate', this.referralAuthData);

                  }

                  // Referral Effective Date Case Handled
                  if (this.referralAuthData.certificationEffectiveDate && this.referralAuthData.certificationEffectiveDate !== '') {
                      this.handleAuthReferralDates(this.referralAuthData.certificationEffectiveDate,
                          'certificationEffectiveDate', this.referralAuthData);
                  }
                  this.loaderService.display(false);
              }
              this.loaderService.display(false);
          },
          error => {
            this.loaderService.display(false);
            this.alertService.error(error.error.errors[0].endUserMessage);
          });

  }

    displayAddress(address) {
      let displayAddress = '';

      // if line1 and line2 is present then check if line2 is there so we can append a comma
      displayAddress = (address.addressLine1 && address.addressLine2)
          ? address.addressLine1 + ', ' + address.addressLine2
          : displayAddress + address.addressLine1 + address.addressLine2;

      // if any value for city,zip or state is present we need to append comma
      displayAddress = displayAddress && (address.city || address.state || address.zip)
          ? displayAddress + ', '
          : displayAddress + '';

        // Check if we have append comma after city or not. That's why we are checking for zip and state here
      displayAddress = address.city && (address.state || address.zip)
          ? displayAddress + address.city + ', '
          : displayAddress + address.city;

      // check to append comma for state and zip
      if (address.state && address.zip) {
          displayAddress = displayAddress + address.state + ', ' + address.zip;
      } else {
          // if both state and zip does not exist then display only one the other will automatically be null
          displayAddress = displayAddress + address.state + address.zip;
      }

       return displayAddress;
    }

    showHideBackToTopButton(value, selectedTabIndex) {
        if (value === 'true') {
            this.goOnTop = false;
        } else if (value === 'false') {
            this.goOnTop = true;
        }
        this.selectedTab = selectedTabIndex;
    }

    handleAuthReferralDates(dateInput, dateType, data) {
        if (dateInput.includes('-')) {
            const dateData = dateInput.split('-');
            switch (dateType) {
                case 'eventDate':
                    data.eventStartDate = dateData[0];
                    data.eventEndDate = dateData[1];
                    break;
                case 'admissionDate':
                    data.admissionStartDate = dateData[0];
                    data.admissionEndDate = dateData[1];
                    break;
                case 'dischargeDate':
                    data.dischargeStartDate = dateData[0];
                    data.dischargeEndDate = dateData[1];
                    break;
                case 'certificationIssueDate':
                    data.certificationIssueStartDate = dateData[0];
                    data.certificationIssueEndDate = dateData[1];
                    break;
                case 'certificationExpirationDate':
                    data.certificationExpirationStartDate = dateData[0];
                    data.certificationExpirationEndDate = dateData[1];
                    break;
                case 'certificationEffectiveDate':
                    data.certificationEffectiveStartDate = dateData[0];
                    data.certificationEffectiveEndDate = dateData[1];
                    break;
                case 'servicesReviewRequestDate':
                    data.servicesReviewRequestStartDate = dateData[0];
                    data.servicesReviewRequestEndDate = dateData[1];
                    break;
                default:
            }

        } else {
            switch (dateType) {
                case 'eventDate':
                    data.eventStartDate = dateInput;
                    data.eventEndDate = '';
                    break;
                case 'admissionDate':
                    data.admissionStartDate = dateInput;
                    data.admissionEndDate = '';
                    break;
                case 'dischargeDate':
                    data.dischargeStartDate = dateInput;
                    data.dischargeEndDate = '';
                    break;
                case 'certificationIssueDate':
                    data.certificationIssueStartDate = dateInput;
                    data.certificationIssueEndDate = '';
                    break;
                case 'certificationExpirationDate':
                    data.certificationExpirationStartDate = dateInput;
                    data.certificationExpirationEndDate = '';
                    break;
                case 'certificationEffectiveDate':
                    data.certificationEffectiveStartDate = dateInput;
                    data.certificationEffectiveEndDate = '';
                    break;
                case 'servicesReviewRequestDate':
                    data.servicesReviewRequestStartDate = dateInput;
                    data.servicesReviewRequestEndDate = '';
                    break;
                default:
            }
        }

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
    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }

}
