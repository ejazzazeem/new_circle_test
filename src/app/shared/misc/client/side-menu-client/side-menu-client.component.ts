import {Component, OnInit, ViewEncapsulation, OnDestroy, AfterViewInit} from '@angular/core';
import { Router } from '@angular/router';
import { AlertService, LoaderService, UserSessionService, AuthenticationService, DataSharingService,
ConsentService } from '../../../../services/index';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { CurrentUser } from '@models/index';
import { Subject } from 'rxjs/Subject';
import { MatDialog } from '@angular/material';
import {SwitchConfirmComponent} from '../switch-confirm/switch-confirm.component';
import set = Reflect.set;
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-side-menu-client',
    providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
    templateUrl: './side-menu-client.component.html',
    styleUrls: ['./side-menu-client.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class SideMenuClientComponent implements OnInit, AfterViewInit, OnDestroy {
    consentUrl: any;
    model: any = { };
    userInfo: any = {};
    obj: any = {};
    isRefreshed = false;
    emptyGroupMessage = false;
    groupList = [];
    permissionList = [];
    userName: string;
    selectedGroup = '';
    permissionIndex: any;
    location: Location;
    userRole: string;
    permission: any = {};
    private currentUser: CurrentUser;
    private unSubscribe = new Subject();
    switchMode = false;
    payerMode = true;
    modeCaption = 'Switch To Practice User Mode';
    showSwtichMessage = false;

    constructor(private userSessionService: UserSessionService,
                private loaderService: LoaderService,
                private router: Router,
                private dataSharingService: DataSharingService,
                private alertService: AlertService,
                private authenticationService: AuthenticationService,
                private consentService: ConsentService,
                private sanitizer: DomSanitizer,
                public dialog: MatDialog,
                location: Location) {
        this.location = location;

        // To Reload current route
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
    }

    ngAfterViewInit() {
        // highlight the side menu items after the permissions have been added
        setTimeout(() => {
            // Do not highlight menu item if user is on home page
            if (this.location.path() !== '/client/home') {
                this.permissionIndex = localStorage.getItem('permissionId');
            }
        }, 10);
    }

    ngOnInit() {
        this.loaderService.display(true);

        // Temporary getting current user from local storage
        const currentUser = localStorage.getItem('currentUser');

        if (currentUser) {
            this.userInfo = JSON.parse(currentUser);
            this.userRole = this.userInfo.role;
            if (this.userRole === 'PAYER_USER') {
                this.updateSwichInfo(this.userInfo);
            }
            this.setSideMenuItems();
        } else {
            // Loads Information from User Session Service
        this.userSessionService.getUserSessionInfo().takeUntil(this.unSubscribe).subscribe(
                data => {
                    this.loaderService.display(true);
                    this.userInfo = data;
                    this.userRole = this.userInfo.role.role;
                    this.populateCurrentUser(data);
                    localStorage.setItem('currentUser', JSON.stringify(data));
                    this.setSideMenuItems();
                    this.loaderService.display(false);
                },
                error => {
                    this.loaderService.display(false);
                    this.alertService.error(error.error.errors[0].endUserMessage);
                }
            );
        }

        if (localStorage.getItem('menuStateClient') === null || localStorage.getItem('menuStateClient') === undefined ) {
            this.obj = {
                smallView: null,
                largeView: null,
                noClass: true
            };
        } else {
            this.obj = JSON.parse(localStorage.getItem('menuStateClient'));
            this.isRefreshed = true;
        }
         const mode = localStorage.getItem('payerMode');
        if (mode !== null && mode !== undefined && mode === 'false') {
            this.payerMode = false;
            this.modeCaption = 'Switch To Payer Mode';
            this.showSwtichMessage = true;
        }
    }

    populateCurrentUser(user): CurrentUser {
        this.currentUser = user;
        // In API, enum value is inside another role object
        this.currentUser.role = user.role.role;
        if (this.currentUser.role === 'HEALTHENET_ADMIN') {
            this.currentUser.isHealtheNetAdmin = true;
        } else if (this.currentUser.role === 'PROVIDER_OFFICE_USER') {
            this.currentUser.isProviderOfficeUser = true;
        } else if (this.currentUser.role === 'PAYER_USER') {
            this.currentUser.isPayerUser = true;
        }
        return this.currentUser;
    }

    setSideMenuItems() {
        // Gets user ID from User Session
        const currentUser = this.userInfo.loginId;
        this.model.userName = currentUser;
        if (currentUser === '') {
            this.userName = 'User Name';
        }
        // Fetch Group List from User Session
        this.emptyGroupMessage = true;
        this.userInfo.userGroups.forEach(obj => {
            this.groupList.push(obj);
        });

        // Selected Group by User
        let i = 0;
        if (localStorage.getItem('selectedGroup') !== null) {
            const UserGroup = JSON.parse(localStorage.getItem('selectedGroup'));
            for ( i ; i <= this.groupList.length; i++) {
                if ( this.groupList[i].groupId === UserGroup) {
                    this.selectedGroup = this.groupList[i].groupId;
                    break;
                }
            }
        }
        if (this.userRole === 'PAYER_USER') {
            for (let x = 0; x < this.userInfo.userPermissionList.length; x++) {
                if (!this.userInfo.userPermissionList[x].permission.custom) {
                    this.permissionList.push(this.userInfo.userPermissionList[x].permission);
                }
            }
        } else if (this.userRole === 'PRACTICE_OFFICE_USER') {
            for (let x = 0; x < this.userInfo.userPermissionList.length; x++) {
                if (!this.userInfo.userPermissionList[x].permission.custom) {
                    this.permissionList.push(this.userInfo.userPermissionList[x].permission);
                }
            }
        }

        // Set permission List in the local storage to get permission Ids for Transaction Page
        this.setPermissionList();

        this.loaderService.display(false);

    }

    setPermissionList() {
        const permissionListToStore = [];
        this.permissionList.forEach(permission => {

                const per = {
                    permissionId: permission.permissionId,
                    name: permission.name,
                    adxId: (permission.adxTransaction !== null) ? permission.adxTransaction.adxTransactionId : ''
                };

            permissionListToStore.push(per);
        });
        this.dataSharingService.setPermissionsList(permissionListToStore);

        localStorage.setItem('permissionList', JSON.stringify(permissionListToStore));
    }


    // Save permission Id temporary
    selectedPermission(perId, perName) {
        localStorage.removeItem('reportDetail');
        localStorage.removeItem('eligibilityFormData');

        localStorage.removeItem('MyReport');
        localStorage.removeItem('currentReport');
        localStorage.removeItem('reportDetail');
        localStorage.removeItem('currentTab');
        this.dataSharingService.setNavigateToOtherTransaction([]);
        this.dataSharingService.setClaimFormData([]);
        this.dataSharingService.setFormDataFromInquiryForm([]);
        if (perName === 'Provider Inquiry Summary') {
            localStorage.setItem('permissionId', perId + '_summary');
            this.permissionIndex = perId + '_summary';
        } else {
            localStorage.setItem('permissionId', perId);
            this.permissionIndex = perId;
        }

        switch (perName) {
            case 'Eligibility Inquiry':
                this.navigateToRoute('eligibility/inquiry');
                break;
            case 'Claims Status Inquiry':
                this.navigateToRoute('claim-status/inquiry');
                break;
            case 'Referral / Authorization Status Inquiry':
                this.navigateToRoute('referral-auth/inquiry');
                break;
            case 'Provider Inquiry':
                this.navigateToRoute('provider-inquiry');
                break;
            case 'Provider Inquiry Summary':
                this.navigateToRoute('provider-inquiry/status');
                break;
            case 'Referral Request':
                this.navigateToRoute('referral/request');
                break;
            case 'Batch':
                this.navigateToRoute('batch-handler/batch');
                break;
            case 'Patient Consent':
                this.navigateToRoute('patient-consent');
                break;
            case 'HEALTHeNET Reporting':
                this.navigateToRoute('reporting/reports');
                break;
            default:
                this.navigateToRoute('home');
                break;
        }
    }

    toggleMenu() {
        if (this.obj.noClass === true) {
            this.obj.smallView = true;
            this.obj.noClass = null;
        } else if (this.obj.smallView === true) {
            this.obj.largeView = true;
            this.obj.smallView = false;
        } else {
            this.obj.largeView = false;
            this.obj.smallView = true;
        }
        this.isRefreshed = false;
        localStorage.setItem('menuStateClient', JSON.stringify(this.obj));
    }

    /**
     * @ngdoc method
     * @name navigateToRoute
     * @methodOf healtheNet.ui.service: SideMenuClientComponent
     * @param viewScreen
     * @paramType string
     * @description
     * navigate to the desired route, if User is already on the route permissionIndex refresh the page if same tab is clicked from
     * side bar.
     */
    navigateToRoute(viewScreen) {
        localStorage.removeItem('InquiryData');
        localStorage.removeItem('query');
        localStorage.removeItem('selectedProvider');
        const activeRoute = this.router.url;
        if (activeRoute.indexOf(viewScreen) !== -1) {
            // To Reload current route
            this.router.navigated = false;
        }
        if ( viewScreen === 'patient-consent') {
            this.consentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.consentService.getConsentFormUrl(null));
            window.open( this.consentUrl.changingThisBreaksApplicationSecurity );
        } else {
            (viewScreen === 'reporting/reports' || viewScreen === 'batch-handler/batch') ? this.router.navigate([viewScreen])
                : this.router.navigate(['/client/' + viewScreen]);
        }
    }

    logout() {
        localStorage.removeItem('ModeSwitch');
        localStorage.removeItem('payerMode');
        this.authenticationService.logout();
    }

    updateSwichInfo(userInfo) {

        if (localStorage.getItem('ModeSwitch') === null || localStorage.getItem('ModeSwitch') === undefined ) {
            this.userSessionService.getUserByUserId(userInfo.userId).takeUntil(this.unSubscribe).subscribe(
                data => {
                    this.switchMode = data.practiceOfficeUserMode;
                    localStorage.setItem('ModeSwitch', this.switchMode.toString());

                },
                error => {

                    this.alertService.error(error.error.errors[0].endUserMessage);
                });
        } else {
            const value = localStorage.getItem('ModeSwitch');
            this.switchMode = (value === 'true') ? true : false ;

        }

    }

    switchUserMode() {
        let message = 'Are you sure you want to Switch to';
        message = this.payerMode ? message + ' Practice Office User Mode' : message + ' Payer User Mode';
        const dialogRef = this.dialog.open(SwitchConfirmComponent, {
            data: {
                title: 'Confirm Switch',
                message: message
            }
        });

        dialogRef.afterClosed().takeUntil(this.unSubscribe).subscribe(result => {
         if (result === 'yes') {
             this.payerMode = !this.payerMode;
             this.modeCaption = this.payerMode ? 'Switch To Practice User Mode' : 'Switch To Payer User Mode';
             if (!this.payerMode) {
                 localStorage.setItem('payerMode', this.payerMode.toString());
             } else {
                 localStorage.removeItem('payerMode');
             }

             const screen = this.getScreenName(this.router.url);
             this.navigateToRoute(screen);
         }
        });

    }
    resetMode() {

        localStorage.removeItem('payerMode');
        const screen = this.getScreenName(this.router.url);
        this.navigateToRoute(screen);
    }

    getScreenName(currentPath) {
        let result = 'home';
        switch (currentPath) {
            case '/client/eligibility/inquiry':
                result = 'eligibility/inquiry';
                break;
            case '/client/claim-status/inquiry':
                result = 'claim-status/inquiry';
                break;
            case '/client/referral-auth/inquiry':
                result = 'referral-auth/inquiry';
                break;
            case '/client/provider-inquiry':
                result = 'provider-inquiry';
                break;
            case '/client/provider-inquiry/status':
                result = 'provider-inquiry/status';
                break;
            case '/client/referral/request':
                result = 'referral/request';
                break;
            case '/client/batch-handler':
                result = 'batch-handler';
                break;
            case 'default': break;
        }
        return result;

        }

    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }

}
