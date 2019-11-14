import {AfterViewInit, Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { LoaderService, AlertService, DataSharingService, ClaimStatusService } from '@services/index';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { currencyType, currencyDisplayOption, currencySymbol } from '@misc/constant';

@Component({
    selector: 'app-claim-status-multi-response',
    templateUrl: './claim-status-multi-response.component.html',
    styleUrls: ['./claim-status-multi-response.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class ClaimStatusMultiResponseComponent implements OnInit, AfterViewInit, OnDestroy {
    // The trigger needed to re-render the table
    dtTrigger: Subject<any> = new Subject();
    // options required for the data table showing record
    dtOptions: DataTables.Settings = {};

    model: any = [];
    claimStatusResponse: any = [];
    // Currency Pipe Options
    type = currencyType;
    symbol = currencySymbol;
    displayOption = currencyDisplayOption;

    private unSubscribe = new Subject();

    constructor(private loaderService: LoaderService,
                private alertService: AlertService,
                private router: Router,
                private dataService: DataSharingService,
                private cdr: ChangeDetectorRef,
                private claimStatusService: ClaimStatusService) { }

    ngAfterViewInit() {
        this.dtTrigger.next();
    }

    ngOnInit() {
        this.loaderService.display(true);

        // options required for the data table showing record
        this.dtOptions = {
            scrollY: '280px',
            scrollCollapse: true,
            searching: false,
            info: false,
            lengthChange: true,
            ordering: false,
            paging: false,
            language: {
                emptyTable: 'No Positive Response Found'
            }
        };

        // un comment this line to get mock data
          // this.claimStatusService.getClaimMultipleResponseData().takeUntil(this.unSubscribe).subscribe(
           this.dataService.getMultipleResponse.takeUntil(this.unSubscribe).subscribe(
            data => {
                if (Object.keys(data).length < 1) {
                    this.router.navigate(['/client/claim-status/inquiry']);
                } else {
                    this.model = data;
                    this.cdr.detectChanges();
                    this.claimStatusResponse = this.model.dependent ? this.model.dependent.claims : this.model.subscriber.claims;
                    // if (this.model.dependent && this.model.dependent.name) {
                    //     this.model.subscriber.name = this.model.dependent.name;
                    // }
                    this.claimStatusResponse.forEach(claimServiceDateObj => {
                        if (claimServiceDateObj.serviceDates) {
                            if (claimServiceDateObj.serviceDates.includes('-')) {
                                const serviceDateData = claimServiceDateObj.serviceDates.split('-');
                                claimServiceDateObj.startDate = serviceDateData[0];
                                claimServiceDateObj.endDate = serviceDateData[1];
                            } else {
                                claimServiceDateObj.startDate = claimServiceDateObj.serviceDates;
                                claimServiceDateObj.endDate = '';
                            }
                        } else {
                            claimServiceDateObj.startDate = '';
                            claimServiceDateObj.endDate = '';
                        }
                    });
                }
                this.loaderService.display(false);
            }, error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.erros[0].endUserMessage);
            });
    }

    /**
     * @ngdoc method
     * @name populateMemberName
     * @methodOf healtheNet.ui.component: ClaimStatusMultiResponseComponent
     * @description
     * Populate the tables with appropriate member names
     */
    populateMemberName(memberName) {
        if (!memberName.family && !memberName.given && !memberName.middle) {
            return '. . . . . . .';
        } else if (memberName.family && !memberName.given && !memberName.middle) {
            return memberName.family;
        } else if (!memberName.family && (memberName.given || memberName.middle)) {
            return `${memberName.given} ${memberName.middle}` ;
        } else {
            return `${memberName.family}, ${memberName.given} ${memberName.middle}`;
        }
    }

    /**
     * @ngdoc method
     * @name navigateToDetailsPage
     * @methodOf healtheNet.ui.component: ClaimStatusMultiResponseComponent
     * @description
     * Set data in observable through data sharing service and
     * navigate to claim status details page.
     */
    navigateToDetailsPage(index) {
        const dataArray = [];
        this.model.claimIndexInList = index;
        dataArray.push(this.model);
        this.dataService.setSingleResponseDetail(this.model);
        this.router.navigate(['client/claim-status/detail']);
    }

    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }
}
