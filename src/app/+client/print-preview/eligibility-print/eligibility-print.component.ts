import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { AlertService, LoaderService, DataSharingService, UtilsService } from '@services/index';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { currencyType, currencyDisplayOption, currencySymbol } from '@misc/constant';
import * as moment from 'moment';
declare function isNumeric(e): any;
@Component({
  selector: 'app-eligibility-print',
  templateUrl: './eligibility-print.component.html',
  styleUrls: ['./eligibility-print.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EligibilityPrintComponent implements OnInit, OnDestroy {

  providerTaxonomy: any;
  providerTaxID: any;
  providerNpi: any;
  transactionData: any;
  payerData: any;
  memberData: any;
  dependentData: any;
  primaryCareData: any;
  dependentPrimaryCareData: any;
  otherInsuranceData: any;
  otherInsurancePayerData: any;
  benefitPlanData: any;
  benefitPlanInNetwork: any;
  planDetailsData: any;
  planOtherDates: any;
  planAdditionalInformation: any;
  benefitsData: any;
  goOnTop = false;

  // In Network
  inNetworkData: any;
  inNetworkDeductible: any;
  inNetworkCopay: any;
  inNetworkCoinsurance: any;
  inNetworkStopLoss: any;
  inNetworkLimits: any;
  // Out Network
  outNetworkData: any;
  outNetworkCheck: boolean;
  // Deductible
  outNetworkDeductible: any;
  depOutNetworkDeductible: any;
  // Copay
  outNetworkCopay: any;
  depOutNetworkCopay: any;
  // Coinsurance
  outNetworkCoinsurance: any;
  depOutNetworkCoinsurance: any;
  // Stop Loss
  outNetworkStopLoss: any;
  depOutNetworkStopLoss: any;
  // Limits
  outNetworkLimits: any;
  depOutNetworkLimits: any;

  benefitsDataArray: any;

  multipleGroupIds: any;
  groupID: any;
  selectedTab: 1;

  stopLoss: any;
  // HNP-6651
  depInNetworkStopLoss: any;

  depinNetwork: any;
  depinNetworkDeductible: any;
  depInNetworkCopay: any;
  depInNetworkCoinsurance: any;
  depInNetworkLimits: any;
  dependentStartDate: any;
  dependentEndDate: any;
  qualifier: any;
  showDependentSection = false;
  showSubscriberSection = true;

  planData: any;

  // Currency Pipe Options
  type = currencyType;
  symbol = currencySymbol;
  displayOption = currencyDisplayOption;

  private unSubscribe = new Subject();
  constructor(private router: Router,
              private alertService: AlertService,
              private loaderService: LoaderService,
              private dataSharingService: DataSharingService) { }

  ngOnInit() {
    this.loaderService.display(true);

    this.dataSharingService.getPrintDataFromInquiryDetails
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          if (Object.keys(data).length === 0) {
            this.router.navigate(['/client/eligibility/inquiry']);
          } else {
            const response = data[0];
            // Out of network check from print dialog
            this.outNetworkCheck = response.outNetworkCheck;
            this.payerData = response.payerAndRequestingProvider;
            this.planData = response.fromMultiplePage ? response.plan : response.plan[0];
            this.memberData = this.planData.member;
            this.dependentData = this.planData.dependent;

            if (this.dependentData !== undefined ) {
              this.showDependentSection = true;
              this.showSubscriberSection = false;
            } else {
              this.showDependentSection = false;
              this.showSubscriberSection = true;
            }

            if (this.dependentData && this.dependentData.planDetails.dates) {
              this.dependentData.planDetails.dates.forEach(eachDate => {
                if (eachDate.date !== null && eachDate.date !== undefined) {
                  this.dependentStartDate = eachDate.date.substr(0, 8);
                  this.dependentEndDate = eachDate.date.substr(8, 15);
                }

                this.qualifier = eachDate.qualifier;
              });
            }

            this.providerNpi = response.providerNpi;
            this.providerTaxonomy = response.providerTaxonomy;
            this.providerTaxID = response.providerTaxID;
            this.transactionData = response.transactionInfo;

            // Group Id case Handled
            if (this.memberData.groupID && typeof (this.memberData.groupID) === 'object') {
              this.multipleGroupIds = this.memberData.groupID;
              this.groupID = '';
            } else if (this.memberData.groupID && typeof (this.memberData.groupID) === 'string') {
              this.multipleGroupIds = '';
              this.groupID = this.memberData.groupID;
            }

            if (this.dependentData) {
              this.dependentPrimaryCareData = this.dependentData.primaryCareProvider;
              if (this.dependentPrimaryCareData !== undefined) {
                this.dependentPrimaryCareData.forEach(dependentPCP => {
                  if (!dependentPCP.contactInfo[0].value && dependentPCP.contactInfo[0].value === '0000000000') {
                    dependentPCP.providerPhone = '';
                  }
                });
              }
            }

            if (this.planData.primaryCareProvider) {
              this.primaryCareData = this.planData.primaryCareProvider;
              this.primaryCareData.forEach(PCP => {
                // Phone number case handled
                if (!PCP.contactInfo[0].value && PCP.contactInfo[0].value === '0000000000') {
                  this.primaryCareData.providerPhone = '';
                }
              });
            }

            // Other Insurance Data
            if ( this.dependentData && this.dependentData.otherInsuranceInformation) {
              this.otherInsuranceData = this.dependentData.otherInsuranceInformation;
            } else {
              this.otherInsuranceData = this.planData.otherInsuranceInformation;
            }
            if (this.otherInsuranceData && this.otherInsuranceData !== '') {

              for (let i = 0; i < this.otherInsuranceData.length; i++) {
                if (this.otherInsuranceData[i].dates) {
                  for (let j = 0; j < this.otherInsuranceData[i].dates.length; j++) {
                    if (this.otherInsuranceData[i].dates[j]) {
                      const dateObj: any = {};
                      dateObj['qualifier'] = this.otherInsuranceData[i].dates[j].qualifier;
                      if (this.otherInsuranceData[i].dates[j].date !== undefined) {
                        if (this.otherInsuranceData[i].dates[j].date.indexOf('-') !== -1) {
                          const split = this.otherInsuranceData[i].dates[j].date.split('-');
                          dateObj['startDate'] = split[0];
                          dateObj['endDate'] = split[1];
                        } else {
                          dateObj['startDate'] = this.otherInsuranceData[i].dates[j].date;
                          dateObj['endDate'] = '';
                        }
                        this.otherInsuranceData[i].dates[j] = dateObj;
                      }

                    }
                  }
                }
              }

              this.otherInsurancePayerData = this.otherInsuranceData.payers;
            }






            this.benefitPlanData = this.planData.benefitPlanCoverage;
            // Benefit Plan Date Case Handled
            if (this.benefitPlanData.dates) {
              this.benefitPlanData.dates.forEach(benefitDatesObj => {
                if (benefitDatesObj.date) {
                  if (benefitDatesObj.date.includes('-')) {
                    const benefitPlanDateData = benefitDatesObj.date.split('-');
                    benefitDatesObj['startDate'] = benefitPlanDateData[0];
                    benefitDatesObj['endDate'] = benefitPlanDateData[1];
                  } else {
                    benefitDatesObj['startDate'] = benefitDatesObj.date;
                    benefitDatesObj['endDate'] = '';
                  }
                }
              });
            }


              if ( this.dependentData && this.dependentData.benefitPlanCoverage.dates) {
                this.dependentData.benefitPlanCoverage.dates.forEach(benefitDatesObj => {
                  if (benefitDatesObj.date) {
                    if (benefitDatesObj.date.includes('-')) {
                      const benefitPlanDateData = benefitDatesObj.date.split('-');
                      benefitDatesObj['startDate'] = benefitPlanDateData[0];
                      benefitDatesObj['endDate'] = benefitPlanDateData[1];
                    } else {
                      benefitDatesObj['startDate'] = benefitDatesObj.date;
                      benefitDatesObj['endDate'] = '';
                    }
                  }
                });
              }


            this.benefitPlanInNetwork = this.benefitPlanData.inNetwork;
            this.planDetailsData = this.planData.planDetails;
            // this.planDetailsData.dates.planDate = '20170101-20230319';
            // Plan Date Case Handled
            if (this.planDetailsData.dates) {
              this.planDetailsData.dates.forEach(datesObj => {
                if (datesObj.date) {
                  if (datesObj.date.includes('-')) {
                    const planDateData = datesObj.date.split('-');
                    datesObj['startDate'] = planDateData[0];
                    datesObj['endDate'] = planDateData[1];
                  } else {
                    datesObj['startDate'] = datesObj.date;
                    datesObj['endDate'] = '';
                  }
                }
              });
            }

            if ( this.dependentData && this.dependentData.planDetails.dates) {
              if (this.dependentData.planDetails.dates) {
                this.dependentData.planDetails.dates.forEach(datesObj => {
                  if (datesObj.date) {
                    if (datesObj.date.includes('-')) {
                      const planDateData = datesObj.date.split('-');
                      datesObj['startDate'] = planDateData[0];
                      datesObj['endDate'] = planDateData[1];
                    } else {
                      datesObj['startDate'] = datesObj.date;
                      datesObj['endDate'] = '';
                    }
                  }
                });
              }
            }


            this.planAdditionalInformation = this.planDetailsData.additionalInformation;
            this.benefitsData = this.planData.benefitsN;

            // In NetWork
            try {
              this.inNetworkData = this.planData.benefitPlanCoverage.inNetwork;

              if (this.inNetworkData.deductible) {
                // Deductible
                this.inNetworkDeductible = this.inNetworkData.deductible;
              }

              if (this.inNetworkData.copay) {
                // Copay
                this.inNetworkCopay = this.inNetworkData.copay;
              }

              if (this.inNetworkData.coinsurance) {
                // Coinsurance
                this.inNetworkCoinsurance = this.inNetworkData.coinsurance;
              }

              if (this.inNetworkData.stopLoss) {
                // Stop Loss
                this.inNetworkStopLoss = this.inNetworkData.stopLoss;

              }

              if (this.inNetworkData.limits) {
                // Limits
                this.inNetworkLimits = this.inNetworkData.limits;
              }

              if (this.dependentData) {
                if (this.dependentData.benefitPlanCoverage) {
                  this.depinNetwork = this.dependentData.benefitPlanCoverage.inNetwork;

                  if (this.dependentData.benefitPlanCoverage.inNetwork.deductible) {
                    this.depinNetworkDeductible = this.dependentData.benefitPlanCoverage.inNetwork.deductible;
                  }

                  if (this.dependentData.benefitPlanCoverage.inNetwork.copay) {
                    // Copay
                    this.depInNetworkCopay = this.dependentData.benefitPlanCoverage.inNetwork.copay;
                  }

                  if (this.dependentData.benefitPlanCoverage.inNetwork.coinsurance) {
                    // Coinsurance
                    this.depInNetworkCoinsurance = this.dependentData.benefitPlanCoverage.inNetwork.coinsurance;
                  }

                  if (this.dependentData.benefitPlanCoverage.inNetwork.stopLoss) {
                    this.depInNetworkStopLoss = this.dependentData.benefitPlanCoverage.inNetwork.stopLoss;
                  }

                  if (this.dependentData.benefitPlanCoverage.inNetwork.limits) {
                    // Limits
                    this.depInNetworkLimits = this.dependentData.benefitPlanCoverage.inNetwork.limits;
                  }
                }
              }



            } catch (e) {
              console.error(e);
              // this.alertService.error('No In Network Data Found !');
            }
            // Out Network
            try {
              this.outNetworkData = this.planData.benefitPlanCoverage.outOfNetwork;

              // Deductible
              if (this.outNetworkData.deductible) {
                this.outNetworkDeductible = this.outNetworkData.deductible;
              }



              if (this.outNetworkData.copay) {
                // Copay
                this.outNetworkCopay = this.outNetworkData.copay;
              }



              if (this.outNetworkData.coinsurance) {
                // Coinsurance
                this.outNetworkCoinsurance = this.outNetworkData.coinsurance;
              }


              if (this.outNetworkData.stopLoss) {
                // Stop Loss
                this.outNetworkStopLoss = this.outNetworkData.stopLoss;
              }

              if (this.outNetworkData.limits) {
                // Limits
                this.outNetworkLimits = this.outNetworkData.limits;
              }


              if (this.dependentData) {
                if (this.dependentData.benefitPlanCoverage.outOfNetwork.deductible) {
                  this.depOutNetworkDeductible = this.dependentData.benefitPlanCoverage.outOfNetwork.deductible;
                }

                if (this.dependentData.benefitPlanCoverage.outOfNetwork.copay) {
                  // Copay
                  this.depOutNetworkCopay = this.dependentData.benefitPlanCoverage.outOfNetwork.copay;
                }

                if (this.dependentData.benefitPlanCoverage.outOfNetwork.coinsurance) {
                  // Coinsurance
                  this.depOutNetworkCoinsurance = this.dependentData.benefitPlanCoverage.outOfNetwork.coinsurance;
                }

                if (this.dependentData.benefitPlanCoverage.outOfNetwork.stopLoss) {
                  // Stop Loss
                  this.depOutNetworkStopLoss = this.dependentData.benefitPlanCoverage.outOfNetwork.stopLoss;

                }

                if (this.dependentData.benefitPlanCoverage.outOfNetwork.limits) {
                  // Limits
                  this.depOutNetworkLimits = this.dependentData.benefitPlanCoverage.outOfNetwork.limits;
                }

              }


            } catch (e) {
              console.error(e);
              // this.alertService.error('No Out Network Data Found !');
            }

            this.benefitsDataArray = this.benefitsData;
          }
          this.loaderService.display(false);
        },
        error => {
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
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

  // unSubscribe the observables to avoid memory leaks
  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }

}
