import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';
import {
  AlertService,
  LoaderService,
  DataSharingService,
  EligibilityService,
} from '@services/index';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { PrintDialogComponent } from '../print-dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';
import {
  currencyDisplayOption,
  currencySymbol,
  currencyType,
} from '@misc/constant';
import { ConsentService } from '../../../services/client/index';
import { ConsentRequest } from '../../../shared/models';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/observable/empty';
import {
  map,
  tap,
  shareReplay,
  catchError,
  pluck,
  take,
  filter,
  withLatestFrom,
  switchMap,
} from 'rxjs/operators';
import isEmpty from 'lodash-es/isEmpty';
import has from 'lodash-es/has';
import isNil from 'lodash-es/isNil';
import find from 'lodash-es/find';
import get from 'lodash-es/get';
import { of } from 'rxjs/observable/of';
import { Subject } from 'rxjs/Rx';
declare function isNumeric(e): any;
@Component({
  selector: 'app-eligibility-details',
  templateUrl: './eligibility-details.component.html',
  styleUrls: ['./eligibility-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EligibilityDetailsComponent implements OnInit, OnDestroy  {
  // Currency Pipe Options
  cType = currencyType;
  cSymbol = currencySymbol;
  cDisplayOption = currencyDisplayOption;

  responseDetail$: Observable<any>;
  patientConsent$: Observable<any>;
  payer$: Observable<any>;
  plan$: Observable<any>;
  transactionInfo$: Observable<any>;

  benefits$: Observable<any[]>;
  benefitNames$: Observable<string[]>;

  permissions$: Observable<any[]>;
  showPermissions$: Observable<boolean>;
  otherInsuranceInformation$: Observable<any[]>;
  benefitActiveIndex: number;
  selectedBenefit: any;

  goOnTop = false;
  isConsent = false;
  selectedTab = 1;
  noPrimaryCareData = false;
  private unSubscribe = new Subject();
  displayConsentLink = false;
  ConsentError = '';
  contacts = [];
  constructor(
    public dialog: MatDialog,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private dataSharingService: DataSharingService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private consentService: ConsentService,
    private eligibilityService: EligibilityService // unused variable
  ) {
    const localPermissions: any[] = JSON.parse(
      localStorage.getItem('permissionList')
    );

    this.isConsent =
      localPermissions.findIndex(
        permission => permission.name === 'Patient Consent'
      ) !== -1
        ? true
        : false;
  }

  ngOnInit() {
    this.loaderService.display(true);
    const lastInquiry = localStorage.getItem('lastInquiry');
    if (!isNil(lastInquiry) && lastInquiry !== 'eligibilityInquiry') {
      this.router.navigate(['/client/eligibility/inquiry']);
      return false;
    }
    this.permissions$ = this.dataSharingService.getPermissionsList.pipe(
      tap((permissions: any[]) => {
        if (isEmpty(permissions)) {
          this.router.navigate(['/client/eligibility-inquiry']);
        }
      }),
      map((permissions: any[]) =>
        permissions.filter(
          permission =>
            permission.name === 'Claims Status Inquiry' ||
            permission.name === 'Referral Request' ||
            permission.name === 'Referral / Authorization Status Inquiry'
        )
      )
    );

    this.showPermissions$ = this.permissions$.pipe(
      map(permissions => !isEmpty(permissions))
    );

    this.responseDetail$ = this.dataSharingService.getSingleResponseDetail.pipe(
      tap(data => {
        if (isEmpty(Object.keys(data))) {
          this.router.navigate(['/client/eligibility/inquiry']);
        }
      }),
      map(data => data[0]),
      shareReplay(), // cache value so we do not need to refetch until a new value is emitted
      catchError(error => this.handleError(error, null))
    );

    this.payer$ = this.responseDetail$.pipe(
      map(response => {
        return {
          ...response.payerAndRequestingProvider,
          providerNpi: null,
          providerTaxID: null,
          providerTaxonomy: response.payerAndRequestingProvider.referenceID,
          contacts: response.payerAndRequestingProvider.contacts
        };
      })
    );
    this.plan$ = this.responseDetail$.pipe(
      map(
        response =>
          response.fromMultiplePage ? response.plan : response.plan[0]
      ),
      map((planData: any) => {
        this.showHideBackToTopButton(false, 1);

        if (has(planData, 'dependent.planDetails.dates')) {
          const depPlanDates = get(planData, 'dependent.planDetails.dates');
          if (!isEmpty(depPlanDates)) {
            for (let i = 0; i < depPlanDates.length; i++) {
              if (
                !isNil(depPlanDates[i].date) ||
                !isEmpty(depPlanDates[i].date)
              ) {
                const dateObj: any = {};
                dateObj['qualifier'] = depPlanDates[i].qualifier;
                if (depPlanDates[i].date.indexOf('-') !== -1) {
                  const split = depPlanDates[i].date.split('-');
                  dateObj['startDate'] = split[0];
                  dateObj['endDate'] = split[1];
                } else {
                  dateObj['startDate'] = depPlanDates[i].date;
                  dateObj['endDate'] = '';
                }
                planData.dependent.planDetails.dates[i] = dateObj;
              }
            }
          }
        }

        if (has(planData, 'planDetails.dates')) {
          const planDates = get(planData, 'planDetails.dates');
          if (!isEmpty(planDates)) {
            for (let i = 0; i < planDates.length; i++) {
              if (!isNil(planDates[i].date) || !isEmpty(planDates[i].date)) {
                const dateObj: any = {};
                dateObj['qualifier'] = planDates[i].qualifier;
                if (planDates[i].date.indexOf('-') !== -1) {
                  const split = planDates[i].date.split('-');
                  dateObj['startDate'] = split[0];
                  dateObj['endDate'] = split[1];
                } else {
                  dateObj['startDate'] = planDates[i].date;
                  dateObj['endDate'] = '';
                }
                planData.planDetails.dates[i] = dateObj;
              }
            }
          }
        }

        if (has(planData, 'dependent.primaryCareProvider')) {
          const primaryCareData = get(
            planData,
            'dependent.primaryCareProvider'
          );
          for (let i = 0; i < primaryCareData.length; i++) {
            const contactInfo = get(primaryCareData, 'contactInfo');
            if (
              !isEmpty(contactInfo) &&
              (isNil(contactInfo[0]) || contactInfo[0] === '0000000000')
            ) {
              planData.dependent.primaryCareProvider[i]['providerPhone'] = '';
            }
          }
        }

        if (has(planData, 'primaryCareProvider')) {
          const primaryCareData = planData.primaryCareProvider;
          for (let i = 0; i < primaryCareData.length; i++) {
            const contactInfo = get(primaryCareData, 'contactInfo');
            if (
              !isEmpty(contactInfo) &&
              (isNil(contactInfo[0]) || contactInfo[0] === '0000000000')
            ) {
              planData.primaryCareProvider[i]['providerPhone'] = '';
            }
          }
        } else {
          this.noPrimaryCareData = true;
        }

        if (has(planData, 'dependent.benefitPlanCoverage.coverage')) {
          // const coverageDates = get(
          //   planData,
          //   'dependent.benefitPlanCoverage.dates'
          // );
          const coverage = get(planData, 'dependent.benefitPlanCoverage.coverage');
          if (!isEmpty(coverage)) {
            for (let j = 0; j < coverage.length; j++) {
              const coverageDates = coverage[j].dates;
              if (!isEmpty(coverageDates)) {
                for (let i = 0; i < coverageDates.length; i++) {
                  if (
                      !isNil(coverageDates[i].date) ||
                      !isEmpty(coverageDates[i].date)
                  ) {
                    const dateObj: any = {};
                    dateObj['qualifier'] = coverageDates[i].qualifier;
                    if (coverageDates[i].date.indexOf('-') !== -1) {
                      const split = coverageDates[i].date.split('-');
                      dateObj['startDate'] = split[0];
                      dateObj['endDate'] = split[1];
                    } else {
                      dateObj['startDate'] = coverageDates[i].date;
                      dateObj['endDate'] = '';
                    }
                    planData.dependent.benefitPlanCoverage.coverage[j].dates[i] = dateObj;
                  }
                }
              }


            }
          }
        }

        if (has(planData, 'benefitPlanCoverage.coverage')) {
          const coverage = get(planData, 'benefitPlanCoverage.coverage');
          if (!isEmpty(coverage)) {
            for (let j = 0; j < coverage.length; j++) {
              const coverageDates = coverage[j].dates;
              if (!isEmpty(coverageDates)) {
                for (let i = 0; i < coverageDates.length; i++) {
                  if (
                      !isNil(coverageDates[i].date) ||
                      !isEmpty(coverageDates[i].date)
                  ) {
                    const dateObj: any = {};
                    dateObj['qualifier'] = coverageDates[i].qualifier;
                    if (coverageDates[i].date.indexOf('-') !== -1) {
                      const split = coverageDates[i].date.split('-');
                      dateObj['startDate'] = split[0];
                      dateObj['endDate'] = split[1];
                    } else {
                      dateObj['startDate'] = coverageDates[i].date;
                      dateObj['endDate'] = '';
                    }
                    planData.benefitPlanCoverage.coverage[j].dates[i] = dateObj;
                  }
                }
              }

            }

          }
        }

        setTimeout(() => {
          this.loaderService.display(false);
        }, 300);

        this.cdr.markForCheck();
        return planData;
      }),
      catchError(error => this.handleError(error, null))
    );

    this.otherInsuranceInformation$ = this.plan$.pipe(
      map(plan => {
        if (has(plan, 'dependent.otherInsuranceInformation')) {
          return get(plan, 'dependent.otherInsuranceInformation');
        } else if (has(plan, 'otherInsuranceInformation')) {
          return get(plan, 'otherInsuranceInformation');
        } else {
          return null;
        }
      })
    );

    this.otherInsuranceInformation$.takeUntil(this.unSubscribe).subscribe(data => {
      if (data !== null && data !== undefined) {
        const otherInsuranceLength = Object.keys(data).length;
        for (let i = 0; i < otherInsuranceLength; i++) {
          if (!isNil(data[i].dates) || !isEmpty(data[i].dates)) {
            for (let j = 0; j < data[i].dates.length; j++) {
              if (!isNil(data[i].dates[j]) || !isEmpty(data[i].dates[j])) {
                const dateObj: any = {};
                dateObj['qualifier'] = data[i].dates[j].qualifier;
                if (data[i].dates[j].date !== undefined) {
                  if (data[i].dates[j].date.indexOf('-') !== -1) {
                    const split = data[i].dates[j].date.split('-');
                    dateObj['startDate'] = split[0];
                    dateObj['endDate'] = split[1];
                  } else {
                    dateObj['startDate'] = data[i].dates[j].date;
                    dateObj['endDate'] = '';
                  }
                  data[i].dates[j] = dateObj;
                }
              }
            }
          }
        }
      }
    });

    this.benefits$ = this.plan$.pipe(
      map(plan => {
        if (has(plan, 'dependent.benefits')) {
          return get(plan, 'dependent.benefits');
        } else if (has(plan, 'benefits')) {
          return get(plan, 'benefits');
        } else {
          return null;
        }
      })
    );

    this.benefitNames$ = this.benefits$.pipe(
      map(benefits => benefits.map(benefit => benefit.benefitName).sort()),
      filter(benefits => !isEmpty(benefits))
    );

    this.transactionInfo$ = this.responseDetail$.pipe(pluck('transactionInfo'));

    if (this.isConsent) {
      this.patientConsent$ = this.plan$.pipe(
        map(planData => {
          if (has(planData, 'dependent')) {
            const dependentData = planData.dependent;

            return <ConsentRequest>{
              firstName: dependentData.dependentName.given,
              lastName: dependentData.dependentName.family,
                gender: dependentData.dependentGender !== '' ? dependentData.dependentGender : null ,
              dateOfBirth: !!dependentData.dependentDoB
                ? moment(dependentData.dependentDoB, 'YYYYMMDD').format(
                    'YYYY-MM-DD'
                  )
                : null,
            };
          } else if (has(planData, 'member')) {
            const memberData = planData.member;

            return <ConsentRequest>{
              firstName: memberData.memberName.given,
              lastName: memberData.memberName.family,
                gender: memberData.memberGender !== '' ? memberData.memberGender : null,
              dateOfBirth: !!memberData.memberDoB
                ? moment(memberData.memberDoB, 'YYYYMMDD').format('YYYY-MM-DD')
                : null,
            };
          } else {
            return null;
          }
        }),
        filter(consentRequest => !isNil(consentRequest)),
        switchMap(consentRequest => {
          /**
           * we need to use switchMap to switch to the "inner" observable here
           * the previous code was performing this call in "map",
           * which would return Observable<Observable<any>>.
           */
          return this.consentService.getConsent(consentRequest).pipe(
            map(response => {
              const consent: any = {
                firstName: consentRequest.firstName,
                lastName: consentRequest.lastName,
                gender: consentRequest.gender,
                dateOfBirth: consentRequest.dateOfBirth,
              };
              localStorage.setItem('consentRequest', JSON.stringify(consent));
              const consents: any[] = response.consents;
              if (isEmpty(consents)) {
                consent['value'] = 'Patient Not Found';
              } else if (consents.length > 1) {
                this.displayConsentLink = true;
                consent['value'] = 'Multiple Patients Found';
                consent['formUrl'] = this.consentService.getConsentFormUrl(
                  consentRequest
                );
              } else {
                const consentValue = consents[0].consentValue;
                if (isNil(consentValue)) {
                  consent['value'] = 'Patient Not Found';
                } else {
                  consent['value'] = consentValue;
                  consent['formUrl'] = this.consentService.getConsentFormUrl(
                      consentRequest
                  );
                  if (
                    consentValue.toUpperCase() === 'YES' ||
                    consentValue.toUpperCase() === 'UNKNOWN'
                  ) {
                    this.displayConsentLink = true;
                  }
                }
              }
              return consent;
            })
          );
        }),
        catchError(error => this.handleConsentError(error, this.patientConsent$ ))
      );
    }
  }

  handleConsentError(error: any, resultIfError: any) {
   if (error.status === 504) {
     this.ConsentError = 'No Response Received';
   } else {
     if (error.error.errors[0].endUserMessage.indexOf('Consent Value Missing') !== -1) {
     this.ConsentError = 'Consent Value Missing';
   } else {
     this.ConsentError = 'No Response Received';
   }
   }
    return !!resultIfError ? of(resultIfError) : empty();
  }

  handleError(error: any, resultIfError: any) {
    console.error(error);
    this.alertService.error(error.error.errors[0].endUserMessage);
    return !!resultIfError ? of(resultIfError) : empty();
  }

  isArray(value: any) {
    return Array.isArray(value);
  }

  openConsentForm(): void {
    this.patientConsent$
      .pipe(
        take(1),
        pluck('formUrl')
      )
      .subscribe((formUrl: string) => {
        if (isNil(formUrl)) {
          this.alertService.error(
            'No form url found. Could not open consent form.'
          );
        } else {
          window.open(formUrl, '_blank');
        }
      });
  }

  selectBenefit(name: string, index: number) {
    this.benefits$
      .pipe(
        map(benefits => find(benefits, ['benefitName', name])),
        take(1)
      )
      .subscribe(benefit => {
        this.benefitActiveIndex = index;
        this.selectedBenefit = benefit;
        this.cdr.markForCheck();
      });
  }

  showHideBackToTopButton(value, selectedTabIndex: number) {
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
   * @methodOf healtheNet.ui.component: EligibilityDetailsComponent
   * @description
   * Redirect from eligibility details page to selected Inquiry
   */
  startInquiry(permission) {
    if (permission.name === 'Claims Status Inquiry') {
      this.router.navigate(['/client/claim-status/inquiry']);
    } else if (permission.name === 'Referral Request') {
      this.router.navigate(['/client/referral/request']);
    } else if (permission.name === 'Referral / Authorization Status Inquiry') {
      this.router.navigate(['/client/referral-auth/inquiry']);
    }
  }

  // Dialog filter before printing
  openDialog(): void {
    // this.eligibilityService.getEligibilityDetailsData()
    this.dataSharingService.getSingleResponseDetail
      .pipe(
        withLatestFrom(this.benefits$),
        take(1)
      )
      .subscribe(([eligibilityData, benefits]) => {
        const config = new MatDialogConfig();
        config.data = {
          eligibilityCompleteData: eligibilityData,
          benefitList: isEmpty(benefits) ? [] : benefits,
        };
        this.dialog.open(PrintDialogComponent, config);
      });
  }
  processDates(dates) {
    if (dates !== null && dates !== undefined) {
      if (dates.length > 1) {
        return (dates.length === 1) ?  this.formatDateObj(dates[0]) : this.formatDateObj(dates[0]) + ' - ' + this.formatDateObj(dates[1]);
      } else {
        return dates[0].qualifier + ' : ' + this.handleDateObject(dates[0].date);
      }
    }

  }
  formatDateObj(data) {
    if (data.date) {
      return data.qualifier + ' : ' + moment(data.date).format('L') ;
    }
  }

  handleDateObject(Obj) {
  if (Obj !== null && Obj !== undefined) {
    if (Obj.indexOf('-') !== -1) {
      const splitted = Obj.split('-');
      return moment(splitted[0]).format('L') + ' - ' + moment(splitted[1]).format('L') ;
    } else {
      return moment(Obj).format('L');
    }
  }

  }

  FormatField(Obj) {
    const val = Obj.label.toLowerCase();
    if (val.indexOf('phone') === -1 && val.indexOf('fax') === -1) {
      return Obj.value;
    } else {
      const value = Obj.value;
      if (value.length === 10 && isNumeric(value)) {
        return '(' + value.slice(0, 3) + ') ' + value.slice(3, 6) + '-' + value.slice(6);
      } else {
        return value;
      }
    }
  }



  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
}
