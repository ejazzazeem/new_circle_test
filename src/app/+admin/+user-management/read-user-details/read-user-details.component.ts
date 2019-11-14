import {Component, OnInit, ViewEncapsulation, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GetUsersService, LoaderService, AlertService } from '@services/index';
import { AddUserModel } from '@models/index';
import * as moment from 'moment';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-read-user-details',
    templateUrl: './read-user-details.component.html',
    styleUrls: ['./read-user-details.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class ReadUserDetailsComponent implements OnInit, OnDestroy {

    model: AddUserModel = {} as AddUserModel;
    emptyGroupMessage = false;
    selectedGroupIndex: any;
    roleViewValue: string;
    groupList = [];
    regionList = [];
    permissionList = [];
    allDataFetched = false;
    userRole: string;
    dob: any;
    private unSubscribe = new Subject();
    practiceOfficeUserMode = false;
    showEditButton  = true;
    currentRole = '';
    createdUpdatedInfo: any = {};
    constructor(private route: ActivatedRoute,
                private router: Router,
                private getUsersService: GetUsersService,
                private loaderService: LoaderService,
                private alertService: AlertService,
                private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.loaderService.display(true);
        const userID = this.route.snapshot.paramMap.get('id');
        const currentUser = localStorage.getItem('currentUser');
        this.currentRole = JSON.parse(currentUser).role;


        // Loads Group Details
        this.getUsersService.getUserByUserId(userID).takeUntil(this.unSubscribe).subscribe(
            data => {
                this.model = data;
                this.createdUpdatedInfo = data.createdUpdatedInfo;
                if (this.createdUpdatedInfo.createdTime !== null && this.createdUpdatedInfo.createdTime !== undefined) {
                    this.createdUpdatedInfo.createdTime =  moment(this.createdUpdatedInfo.createdTime).format('YYYY-MM-DD hh:mm:ss');
                }
                if (this.createdUpdatedInfo.updatedTime !== null && this.createdUpdatedInfo.updatedTime !== undefined) {
                    this.createdUpdatedInfo.updatedTime =  moment(this.createdUpdatedInfo.updatedTime).format('YYYY-MM-DD hh:mm:ss');
                }
                this.cdr.detectChanges();
                this.userRole = this.model.role.role;
                switch (this.userRole) {
                    case 'PRACTICE_OFFICE_USER':
                        this.roleViewValue = 'Practice Office User';
                        break;
                    case 'PAYER_USER':
                        this.roleViewValue = 'Payer User';
                        break;
                    case 'NETEXCHANGE_ACCOUNT':
                        this.roleViewValue = 'Net Exchange User';
                        break;
                    case 'LEVEL_2_ADMINISTRATOR':
                        this.roleViewValue = 'Level 2 Admin';
                        break;
                    case 'LEVEL_1_ADMINISTRATOR':
                        this.roleViewValue = 'Level 1 Admin';
                        break;
                    default:
                        break;
                }

                // Date of birth convert to date
                this.dob = moment(this.model.dateOfBirth).toDate();
                this.model.dateOfBirth = this.dob;
                this.groupList = [];
                this.model.userGroups.forEach(obj => {
                    this.groupList.push(obj);
                });
                this.regionList =  data.userRegionList;
                this.permissionList = data.userPermissionList;
                this.practiceOfficeUserMode = data.practiceOfficeUserMode;
                this.allDataFetched = true;
                if (this.currentRole === 'LEVEL_1_ADMINISTRATOR' && this.roleViewValue === 'Level 2 Admin') {
                    this.showEditButton = false;
                }

                this.loaderService.display(false);
            },
            error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
    }

    getRegionsAndPermissions(selectedGroup, index) {
        this.regionList = [];
        this.permissionList = [];
        this.selectedGroupIndex = index;
        this.loaderService.display(true);
        this.model.regionOverrides.forEach(obj => {
            if (obj.exclude === false) {
                if (obj.group.groupId === selectedGroup.groupId) {
                    this.regionList.push(obj.region);
                }
            }
        });
        this.model.permissionOverrides.forEach(obj => {
            if (obj.exclude === false) {
                if (obj.group.groupId === selectedGroup.groupId) {
                    this.permissionList.push(obj.permission);
                }
            }
        });
        this.loaderService.display(false);
        this.emptyGroupMessage = false;
    }

    editUser (userID) {
        this.router.navigate(['admin/userManagement/update', userID]);
    }

    returnToList() {
        this.router.navigate(['admin/userManagement/']);
    }

    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }

}
