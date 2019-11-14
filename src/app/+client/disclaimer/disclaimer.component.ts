import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DisclaimerDialogComponent } from '@misc/client/disclaimer-dialog/index';
import { Router } from '@angular/router';
import { AlertService, LoaderService, UserSessionService, DisclaimerService } from '@services/index';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-disclaimer',
    templateUrl: './disclaimer.component.html',
    styleUrls: ['./disclaimer.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DisclaimerComponent implements OnInit, OnDestroy {

    model: any = {};
    userInfo: any = {};
    emptyGroupMessage = false;
    disclaimerText = '';
    notEmpty = false;
    oneGroup = false;
    payerOrGroup = '';
    selectedGroup = '';
    display: any;
    allDataFetched = false;
    userRole: string;
    private unSubscribe = new Subject();

    constructor(private userSessionService: UserSessionService,
                private alertService: AlertService,
                private loaderService: LoaderService,
                private router: Router,
                private disclaimerService: DisclaimerService,
                public dialog: MatDialog) { }

    ngOnInit() {
        this.loaderService.display(true);
        this.display = localStorage.getItem('displayDisclaimer');

        // Getting Current user from local storage
        const currentUser = localStorage.getItem('currentUser');

        if (currentUser) {
            this.userInfo = JSON.parse(currentUser);
            this.userRole = this.userInfo.role;
            this.setDisclaimerItems();
        } else {
            // Loads Information from User Session Service
            this.userSessionService.getUserSessionInfo().takeUntil(this.unSubscribe)
                .takeUntil(this.unSubscribe).subscribe(
                data => {
                    this.userInfo = data;
                    this.userRole = this.userInfo.role.role;
                    this.setDisclaimerItems();
                },
                error => {
                    this.loaderService.display(false);
                    this.alertService.error(error.error.errors[0].endUserMessage);
                }
            );
        }

        // Get Disclaimer Text
        this.disclaimerService.getDisclaimerText().takeUntil(this.unSubscribe)
            .takeUntil(this.unSubscribe).subscribe(
            data => {
                this.disclaimerText = data;

                // Disclaimer Page Needs to Show or Not
                if (this.display === 'true') {
                    setTimeout(() => {
                        const dialogRef = this.dialog.open(DisclaimerDialogComponent, {
                            disableClose: true,
                            data: {
                                'selectedGroup': this.model.selectedGroup,
                                'groupList': this.userInfo.userGroups,
                                'oneGroup': this.model.oneGroup,
                                'notEmpty': this.model.notEmpty,
                                'disclaimerText': this.disclaimerText,
                                'payerOrGroup': this.model.payerOrGroup
                            }
                        });
                        this.loaderService.display(false);
                    }, 2000);
                } else if (this.display === 'false') {
                    this.dialog.closeAll();
                    localStorage.removeItem('selectedGroup');
                    localStorage.removeItem('displayDisclaimer');
                    this.router.navigate(['/login']);
                }
                this.allDataFetched = true;
            },
            error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
    }

    setDisclaimerItems () {
        // Payer or Provider
        if (this.userRole === 'PROVIDER_OFFICE_USER') {
            this.model.payerOrGroup = 'Group';
        } else if (this.userRole === 'PAYER_USER') {
            this.model.payerOrGroup = 'Payer';
        }
        // Fetching Groups
        this.emptyGroupMessage = true;

        if (this.userInfo.userGroups.length > 0) {
            // If there is only One Group or Payer
            if (this.userInfo.userGroups.length === 1) {
                localStorage.setItem('selectedGroup', JSON.stringify(this.userInfo.userGroups[0].groupId));
                this.model.oneGroup = true;
            }
            this.model.selectedGroup = this.userInfo.userGroups[0].groupId;
            this.model.notEmpty = true;
        } else {
            // If there is no Group or Payer
            this.userInfo.selectedGroup = '';
            this.model.notEmpty = false;
        }
    }

    ngOnDestroy() {
        this.dialog.closeAll();

        // unSubscribe the observables to avoid memory leaks
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }

}
