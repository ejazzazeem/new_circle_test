import {Component, OnInit, ViewEncapsulation, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { Router } from '@angular/router';
import { ProviderService, AlertService, LoaderService, DataSharingService } from '@services/index';
import { Subject } from 'rxjs/Subject';


@Component({
  selector: 'app-provider-inquiry-multi-response',
  templateUrl: './provider-inquiry-multi-response.component.html',
  styleUrls: ['./provider-inquiry-multi-response.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,

})
export class ProviderInquiryMultiResponseComponent implements OnInit, OnDestroy {
  dtOptions: any;
  providerData: any;
  getFormData: any;
  singleResponse: any;
  payerData: any;
  inquiryData: any;
  private unSubscribe = new Subject();


    constructor(
      private providerService: ProviderService,
      private alertService: AlertService,
      private loaderService: LoaderService,
      private dataSharingService: DataSharingService,
      private router: Router,
      private cdr: ChangeDetectorRef) {
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
        emptyTable: 'No Response Found'
      }
    };
    this.loaderService.display(true);

    // Get Subscriber or Member Information if no response occurs
    this.dataSharingService.getFormDataFromInquiryForm
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          this.getFormData = data;
          this.payerData = this.getFormData.payer;
          this.inquiryData = this.getFormData.inquirySummaryFilter;
        }, error => {
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        });

    this.displayMultipleResponse();
  }

  /**
   * @ngdoc method
   * @name displayMultipleResponse
   * @methodOf healtheNet.ui.component: ProviderInquiryMultiResponseComponent
   * @description
   * Manipulate data to display in respective tables
   */
  displayMultipleResponse() {
    this.dataSharingService.getMultipleResponse.takeUntil(this.unSubscribe).subscribe(
        data => {
          if (Object.keys(data).length < 1) {
            this.router.navigate(['/client/provider-inquiry/status']);
          } else {
            this.providerData = data;
              // this.cdr.detectChanges();

              this.loaderService.display(false);
          }
        }, error => {
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        }
    );
  }

  /**
   * @ngdoc method
   * @name navigateToDetailsPage
   * @methodOf healtheNet.ui.component: ProviderInquiryMultiResponseComponent
   * @description
   * Set data in observable through data sharing service and
   * navigate to provider inquiry details page.
   */
  navigateToDetailsPage(response) {
    this.singleResponse = {
      'payer': {
        'payerId': this.payerData.payerId,
        'name': this.payerData.name
      },
        inquiryId: response.inquiryId
    };
    this.providerService.getProviderSummaryDetails(this.singleResponse)
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          if (Object.keys(data).length < 1) {
            this.router.navigate(['/client/provider-inquiry/status']);
          } else {
            this.providerData = data;
             // this.cdr.detectChanges();
              const dataArray = [];
            dataArray.push(data);
            this.dataSharingService.setSingleResponseDetail(dataArray);
            this.router.navigate(['/client/provider-inquiry/detail']);
            this.loaderService.display(false);
          }
        }, error => {
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        }
    );
  }

    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }

}
