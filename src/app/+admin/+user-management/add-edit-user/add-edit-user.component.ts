import {Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {MatAutocompleteTrigger, MatDialog} from '@angular/material';
import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { AddUserModel, DataRequest } from '@models/index';
import { AlertService, LoaderService,
    AddEditUserService, GetUsersService, GroupListService, GetGroupsService,
    ViewAllPayersService, PayerDetailsService,
    GetRegionsService, AddEditGroupService } from '@services/index';
import { PerfectScrollbarConfigInterface,
    PerfectScrollbarComponent, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import {current} from "codelyzer/util/syntaxKind";
declare function isNumberKey(e, target): any;
declare function isValidDate(e): any;
@Component({
    selector: 'app-add-edit-user',
    templateUrl: './add-edit-user.component.html',
    styleUrls: ['./add-edit-user.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})

export class AddEditUserComponent implements OnInit, OnDestroy {
    @ViewChild('autoCompleteInput', {read: MatAutocompleteTrigger})
    @ViewChild(PerfectScrollbarComponent) componentRef?: PerfectScrollbarComponent;
    @ViewChild(PerfectScrollbarDirective) directiveRef?: PerfectScrollbarDirective;
    autoComplete: MatAutocompleteTrigger;

    model: any = {};
    userGroups: any = [];
    AllGroups: any = [];
    AllRegions: any = [];
    displayedUserGroups = [];
    userGroupsList: any = [];
    regionList: any = [];
    permissionList: any = [];
    searchResult: any;
    dataRequest: DataRequest = {
        'keyword': '',
        'sortField': {
            'page': {
                'offSet': 0,
                'size': 200
            },
            'sortField': {
                'fieldName': 'name',
                'sortOrder': 'ASC'
            }
        }
    };

    title: string;
    isEdit = false;
    allDataFetched = false;
    fromOnInit = true;
    loginVerified = false;
    invalidLoginID = false;
    validationMessage: string;
    userRoles = [
        {role: 'PRACTICE_OFFICE_USER', viewValue: 'Practice Office User'},
        {role: 'PAYER_USER', viewValue: 'Payer User'},
        {role: 'NETEXCHANGE_ACCOUNT', viewValue: 'NetExchange Account'},
        {role: 'LEVEL_2_ADMINISTRATOR', viewValue: 'Level 2 Administrator'},
        {role: 'LEVEL_1_ADMINISTRATOR', viewValue: 'Level 1 Administrator'}
    ];

    emptyGroupMessage = false;
    emptyRegionMessage = false;
    emptyPermissionMessage = true;
    selectedGroup: any;
    selectedGroupIndex: any;
    checkedGroupList: any = [];
    checkedRegionOverrides: any = [];
    checkedPermissionOverrides: any = [];
    maxDate: any;
    minDate: any;
    userLoginId: any;

    searchValue: any;
    searchedGroups: any;
    selectedIndex: any;
    noGroupsReturnedMessage = true;
    dateErr = false;
    dateMsg = '';
    dob: any;
    private unSubscribe = new Subject();
    userID = '';
    editPermissionList = [];
    practiceOfficeUserMode: false;
    currentRole = '';
    netExchangePermissions = ['Eligibility Inquiry', 'Claims Status Inquiry', 'Referral Request',
        'Referral / Authorization Status Inquiry', 'Batch'];
    type = 'text';
    txtQuery: string;
    txtQueryChanged: Subject<string> = new Subject<string>();
    previousRole = '';
    previousRegions = [];
    removedFromIndex = 0;
    removedPermission: any;
    ddateErr = false;
    ddateMsg = '';
    deactiveDate = null;
    minDeactivationDate = moment().toDate();
  previousStatus = '';
    constructor(private route: ActivatedRoute,
                private router: Router,
                private alertService: AlertService,
                private loaderService: LoaderService,
                public dialog: MatDialog,
                private groupListService: GroupListService,
                private viewAllPayersService: ViewAllPayersService,
                private addEditUserService: AddEditUserService,
                private getUsersService: GetUsersService,
                private getGroupsService: GetGroupsService,
                private getRegionsService: GetRegionsService,
                private addEditGroupService: AddEditGroupService,
                private payerDetailsService: PayerDetailsService,
                private cdr: ChangeDetectorRef) {
        this.minDeactivationDate.setHours(0,0,0,0);

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

    /**
     * @ngdoc Built-In method
     * @name ngOnInit
     * @methodOf healtheNet.ui.component: AddEditUserComponent
     * @description
     * Initialize variables and check if page requested is edit or add
     * so approriate measures can be taken.
     */
    ngOnInit() {
        this.loaderService.display(true);
        const userObj = localStorage.getItem('currentUser');
        this.currentRole = JSON.parse(userObj).role;
        if (this.currentRole === 'LEVEL_1_ADMINISTRATOR') {
            this.userRoles = [
                {role: 'PRACTICE_OFFICE_USER', viewValue: 'Practice Office User'},
                {role: 'PAYER_USER', viewValue: 'Payer User'},
                {role: 'NETEXCHANGE_ACCOUNT', viewValue: 'NetExchange Account'},
                {role: 'LEVEL_1_ADMINISTRATOR', viewValue: 'Level 1 Administrator'}
            ];
        }

        this.previousStatus = this.model.enabled;
        this.minDate = new Date(1900, 0, 1); // user cannot select date before 1900
        this.maxDate = new Date(); // user cannot select future date for DOB

        // If 'Edit User' Page
        if (this.route.snapshot.paramMap.get('id')) {
            this.userID = this.route.snapshot.paramMap.get('id');
            this.title = 'Edit User';
            this.isEdit = true;
            this.type = 'password';
            // Service call to fetch user data by user id
            this.getUsersService.getUserByUserId(this.userID).takeUntil(this.unSubscribe).subscribe(
                data => {
                    this.model = data;
                    // this.cdr.detectChanges();
                    this.model.role = {
                        role: data.role.role
                    };
                    this.previousRole = this.model.role.role;
                    // Convert Date of Birth from String to Date.........
                    // To get a copy of the native Date object that Moment.js wraps
                    this.dob = moment(this.model.dateOfBirth).toDate();
                    this.model.dateOfBirth = this.dob;
                    if (data.deactivationDate !== null) {
                        this.deactiveDate = moment(data.deactivationDate).toDate();
                    }
                    this.previousStatus = data.enabled;
                    // saving this to check for loginID for that particular user in validateLoginId()
                    this.userLoginId = data.loginId;
                    // loader gets off after get groups or payers is called...
                    data.userGroups.forEach((eachObj, i) => {
                        const group = {
                            groupId: eachObj.groupId,
                            name: eachObj.name,
                            groupType: eachObj.groupType,
                            checked: true
                        };

                        this.userGroups.push(group);
                    });
                    if (this.model.role.role === 'PRACTICE_OFFICE_USER') {
                        // Call service to get list of all Regions
                        this.getAllRegions();

                        // Call service to get list of all groups
                        this.getAllGroups();
                    } else if (this.model.role.role === 'NETEXCHANGE_ACCOUNT' || this.model.role.role === 'PAYER_USER') {
                        // Call service to get list of all Payers
                        this.getAllPayers();
                    }


                    this.practiceOfficeUserMode = (data.practiceOfficeUserMode !== null) ? data.practiceOfficeUserMode : false;
                    this.loadPermissions();

                    setTimeout(() => {
                        this.fromOnInit = false;
                        this.allDataFetched = true;
                        this.emptyGroupMessage = true;
                        this.editPermissionList = data.userPermissionList;
                        if (this.model.role.role !== 'LEVEL_2_ADMINISTRATOR' && this.model.role.role !== 'LEVEL_1_ADMINISTRATOR') {
                            this.checkSelectedGroupsRegionsPermissions(data);
                        }


                        this.loaderService.display(false);
                    }, 1500);

                }, error => {
                    this.loaderService.display(false);
                    this.alertService.error(error.error.errors[0].endUserMessage);
                }
            );
        } else {
            // If 'Add User' Page
            this.title = 'Add New User';
            this.isEdit = false;
            this.emptyGroupMessage = true;
            this.model.enabled = true;
            this.model.role = {
                role: ''
            };
            setTimeout(() => {
                this.allDataFetched = true;
                this.fromOnInit = false;
                this.loaderService.display(false);
            }, 1000);
        }
    }

    closeAuto() {
        this.autoComplete.closePanel();
    }

    /**
     * @ngdoc method
     * @name getAllRegions
     * @methodOf healtheNet.ui.component: AddEditUserComponent
     * @description
     * Fetch all regions to figure out names for a group because getPayerDetailsByPayerId service
     * returns only regionIds.
     */
    getAllRegions() {
        this.getRegionsService.getAllRegions().takeUntil(this.unSubscribe).subscribe(
            data => {
                this.AllRegions = data;
                // this.cdr.detectChanges();
                if (this.AllRegions.length !== 0) {
                    this.emptyRegionMessage = false;
                    this.AllRegions.forEach(obj => {
                        const region = {
                            regionId: obj.regionId,
                            name: obj.name,
                            checked: false
                        };

                        this.regionList.push(region);
                    });
                } else {
                    this.emptyRegionMessage = true;
                }
            }, error => {
                this.emptyRegionMessage = true;
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
    }

    /**
     * @ngdoc method
     * @name getAllGroups
     * @methodOf healtheNet.ui.component: AddEditUserComponent
     * @description
     * Service call to fetch All groups
     */
    getAllGroups() {
        // don't do anything to loader if function called from on ini
        if (!this.fromOnInit) {
            this.loaderService.display(true);
        }
        this.groupListService.getGroups().takeUntil(this.unSubscribe).subscribe(
            data => {
                this.userGroupsList = data; // data.results;
                // this.cdr.detectChanges();
                this.noGroupsReturnedMessage = data.length === 0; // data.results.length === 0;
                this.userGroupsList.forEach(eachObj => {
                    if (eachObj['status'] === 'ACTIVE') {
                        const group = {
                            groupId: eachObj['providerGroupId'],
                            name: eachObj['name'],
                            groupType: 'PROVIDER',
                            checked: false
                        };

                        this.AllGroups.push(group);
                    }
                });
                if (this.model.role.role === 'PRACTICE_OFFICE_USER' && this.userID !== '') {

                    const x = this.AllGroups.filter(group => group.groupId === this.userGroups[0].groupId);

                    if (x.length === 0) {
                        this.AllGroups = this.userGroups.concat(this.AllGroups);

                    }
                }
                if (this.isEdit) {
                    if (this.model.role.role === this.previousRole) {
                        this.displayedUserGroups = this.userGroups;
                    }
                }
                // don't do anything to loader if function called from on ini
                if (!this.fromOnInit) {
                    this.loaderService.display(false);
                }
            }, error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
    }

    /**
     * @ngdoc method`
     * @name getAllPayers
     * @methodOf healtheNet.ui.component: AddEditUserComponent
     * @description
     * Service to fetch All Payers
     */
    getAllPayers() {
        // don't do anything to loader if function called from on ini
        if (!this.fromOnInit) {
            this.loaderService.display(true);
        }
        this.viewAllPayersService.getAllPayers(this.dataRequest).takeUntil(this.unSubscribe).subscribe(
            data => {
                this.userGroupsList = data.results;
                // this.cdr.detectChanges();
                this.noGroupsReturnedMessage = (data.results.length === 0);
                this.userGroupsList.forEach(eachObj => {
                    if (eachObj['status'] === 'ACTIVE') {
                        const group = {
                            groupId: eachObj['payerId'],
                            name: eachObj['name'],
                            groupType: 'PAYER',
                            checked: false
                        };

                        this.AllGroups.push(group);
                    }

                    // if (!this.isEdit) {
                    this.displayedUserGroups = this.AllGroups;
                    // }
                });
                // don't do anything to loader if function called from on ini
                if (!this.fromOnInit) {
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
     * @name updateGroupList
     * @methodOf healtheNet.ui.component: AddEditUserComponent
     * @description
     * Get Group list for respective user.
     */
    updateGroupList() {
        this.loaderService.display(true);

        this.AllGroups = [];
        this.selectedGroupIndex = '';
        this.selectedIndex = '';
        this.selectedGroup = [];
        this.permissionList = [];
        this.regionList = [];
        this.checkedGroupList = [];
        this.checkedRegionOverrides = [];
        this.checkedPermissionOverrides = [];
        this.emptyGroupMessage = true;
        this.searchValue = '';
        this.searchedGroups = [];
        this.displayedUserGroups.splice(0, this.displayedUserGroups.length);
        this.txtQuery = '';
        if (this.model.role.role !== 'LEVEL_2_ADMINISTRATOR' && this.model.role.role !== 'LEVEL_1_ADMINISTRATOR') {
            const role = this.model.role.role === 'PRACTICE_OFFICE_USER' ? 'Practice Office User' : 'Payer User';

            this.addEditUserService.getPermissionByRole(role).takeUntil(this.unSubscribe).subscribe(
                data => {
                    this.permissionList = data;
                    //   this.cdr.detectChanges();
                    if (this.model.role.role !== 'NETEXCHANGE_ACCOUNT') {
                        this.permissionList.forEach(obj => {
                            obj.checked = obj.type.indexOf('Active') !== -1;
                        });
                    }

                    const tempList = this.permissionList;
                    this.permissionList = [];
                    for (let i = 0; i < tempList.length; i++) {
                        if (tempList[i].type.indexOf('Active') !== -1) {
                            this.permissionList.push(tempList[i]);
                        }
                    }
                    // if (this.model.role.role !== 'NETEXCHANGE_ACCOUNT') {
                    for (let i = 0; i < tempList.length; i++) {
                        if (tempList[i].type.indexOf('Active') === -1) {
                            this.permissionList.push(tempList[i]);
                        }
                    }

                    if (this.model.role.role === 'NETEXCHANGE_ACCOUNT') {
                        const selectedList = [];
                        this.permissionList.forEach((eachObj) => {
                            if (this.netExchangePermissions.includes(eachObj.name)) {
                                selectedList.push(eachObj);
                            }
                        });
                        this.permissionList = selectedList;
                    }

                    if (role === 'Payer User') {
                        for (let i = 0; i < this.permissionList.length; i++) {
                            if (this.permissionList[i].name === 'Provider Inquiry') {
                                this.removedFromIndex = i;
                                this.removedPermission = this.permissionList[i];
                                this.permissionList.splice(i, 1);
                                break;
                            }
                        }
                    }

                    this.emptyPermissionMessage = false;
                }, error => {
                    this.emptyPermissionMessage = true;

                    this.alertService.error(error.error.errors[0].endUserMessage);
                }
            );
        }

        if (this.model.role.role === 'PRACTICE_OFFICE_USER') {

            // Call service to get list of all Regions
            this.getAllRegions();
            // Call service to get list of all groups
            this.getAllGroups();
            this.loaderService.display(false);
        } else if (this.model.role.role === 'NETEXCHANGE_ACCOUNT' || this.model.role.role === 'PAYER_USER') {
            // Call service to get list of all payers
            this.getAllPayers();
        } else {
            this.loaderService.display(false);
        }
    }


    /**
     * @ngdoc method
     * @name filteredGroups
     * @methodOf healtheNet.ui.component: AddEditUserComponent
     * @description
     * Get searched groups from displayed list
     */
    filteredGroups(val: string) {
        this.searchedGroups = [];
        if (val) {
            const filterValue = val.toLowerCase();
            return this.displayedUserGroups.filter(
                groupName => groupName.name.toLowerCase().startsWith(filterValue));
        }

        return this.displayedUserGroups;
    }

    /**
     * @ngdoc method
     * @name cancelForm
     * @methodOf healtheNet.ui.component: AddEditUserComponent
     * @description
     * Required to cancel the Form. Redirects to view all users page
     */
    cancelForm() {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Confirm Cancel',
                message: 'Are you sure you want to cancel ?',
                componentName: 'AddUserComponent'
            }
        });
    }

    /**
     * @ngdoc method
     * @name getGroupPermissions
     * @methodOf healtheNet.ui.component: AddEditUserComponent
     * @description
     * Service call to get permissions for a specific group
     */
    getGroupPermissions(selectedGroup) {
        // don't do anything to loader if function called from on ini
        if (!this.fromOnInit) {
            this.loaderService.display(true);
        }
        this.permissionList = [];
        this.getGroupsService.getGroupAndAuthorizedContactByGroupId(selectedGroup.groupId)
            .takeUntil(this.unSubscribe).subscribe(
            data => {
                // Check if a group has permissions or not
                if (data.defaultPermissions.length !== 0) {
                    // Get Permissions for selected group
                    data.defaultPermissions.forEach(eachObj => {
                        const permissionOverRide = {
                            group: selectedGroup,
                            permission: {
                                permissionId: eachObj['permissionId'],
                                name: eachObj['name'],
                                checked: true
                            },
                            exclude: false
                        };
                        // Keep Permission List updated
                        if (this.permissionList.findIndex(
                                x => x.name === permissionOverRide.permission.name) === -1) {
                            this.permissionList.push(permissionOverRide.permission);
                        }

                        // Keep PermissionOverrides updated
                        this.checkedPermissionOverrides.forEach(obj => {
                            if (obj.group.groupId === selectedGroup.groupId) {
                                // update displayed permission list
                                this.permissionList.forEach(permission => {
                                    if (permission.name === obj.permission.name) {
                                        permission.checked = !obj.exclude;
                                    }
                                });
                            }
                        });

                    });
                }
                // don't do anything to loader if function called from on init
                if (!this.fromOnInit) {
                    setTimeout(() => {
                        this.loaderService.display(false);
                    }, 1000);
                }
            }, error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
    }

    /**
     * @ngdoc method
     * @name getGroupRegionsAndPermissions
     * @methodOf healtheNet.ui.component: AddEditUserComponent
     * @description
     * Call getGroupsService to get group list
     */
    getGroupRegionsAndPermissions(selectedGroup) {
        // Function call to get the information (regions and Permissions) for the selected group
        // If groupType is NOT payer then call service to get provider group list
        // If group type is payer then call service to get payer group list----------------
        setTimeout(() => {
            (selectedGroup.groupType === 'PROVIDER')
                ? this.getGroupDetailsByGroupId(selectedGroup)
                : this.getPayerDetailsByPayerId(selectedGroup);
        }, 1000);
    }

    /**
     * @ngdoc method
     * @name getRegionPermissions
     * @methodOf healtheNet.ui.component: AddEditUserComponent
     * @description
     * Call permissions for a list of checked regions
     */
    getRegionPermissions(selectedGroup) {
        // don't do anything to loader if function called from on ini
        if (!this.fromOnInit) {
            this.loaderService.display(true);
        }
        this.selectedGroup = selectedGroup;
        const regionIds = [];
        this.regionList.forEach(obj => {
            if (obj.checked === true) {
                regionIds.push(obj.regionId);
            }
        });

        if (regionIds.length !== 0) {
            this.addEditGroupService.getPermissions(regionIds).takeUntil(this.unSubscribe).subscribe(
                data => {
                    if (data.length > 0) {
                        data.forEach(obj => {
                            // Prepare permissionOverRide Array
                            const permissionOverRide = {
                                group: {
                                    groupId: this.selectedGroup.groupId,
                                    name: this.selectedGroup.name,
                                    groupType: this.selectedGroup.groupType
                                },
                                permission: {
                                    permissionId: obj.permissionId,
                                    name: obj.name,
                                    checked: false
                                },
                                exclude: true
                            };

                            // UPDATE DISPLAYED PERMISSION LIST
                            // check if permission is in displayed Permission list. if not then push in list
                            const index = this.permissionList.findIndex(x =>
                            x.name === obj.name);
                            if (index === -1) {
                                this.permissionList.push(permissionOverRide.permission);
                            }

                            // UPDATE DISPLAYED PERMISSION OVERRIDES LIST
                            // check if it is in checkedPermissionOverrides list
                            const indexInList = this.checkedPermissionOverrides.findIndex(
                                x => x.permission.name === obj.name
                                && x.group.groupId === this.selectedGroup.groupId);
                            // if not in list then push to list
                            if (indexInList === -1) {
                                this.checkedPermissionOverrides.push(permissionOverRide);
                            }
                        });

                        this.checkedPermissionOverrides.forEach(per => {
                            if ((per.group.groupId === this.selectedGroup.groupId)) {
                                this.permissionList.forEach(permission => {
                                    if (permission.name === per.permission.name) {
                                        permission.checked = !per.exclude;
                                    }
                                });
                            }
                        });

                        this.emptyPermissionMessage = false;
                        if (!this.fromOnInit) {
                            setTimeout(() => {
                                this.loaderService.display(false);
                            }, 1000);
                        }
                    } else {
                        // Display group permission
                        this.getGroupPermissions(this.selectedGroup);
                    }

                },
                error => {
                    this.loaderService.display(false);
                    this.alertService.error(error.error.errors[0].endUserMessage);
                }
            );
        } else {
            // Display group permission
            this.getGroupPermissions(this.selectedGroup);
        }
    }

    /**
     * @ngdoc method
     * @name getGroupDetailsByGroupId
     * @methodOf healthenet.ui.component: AddEditUserComponent
     * @description
     * Call 'getGroupByGroupId' to fetch regions and permissions for a selected group
     */
    getGroupDetailsByGroupId(selectedGroup) {
        // don't do anything to loader if function called from on ini
        if (!this.fromOnInit) {
            this.loaderService.display(true);
        }
        // unCheck all regions. They will be updated after service call
        this.regionList.forEach(obj => {
            obj.checked = false;
        });

        this.getGroupsService.getGroupAndAuthorizedContactByGroupId(selectedGroup.groupId).takeUntil(this.unSubscribe).subscribe(
            data => {
                if (data.defaultRegions.length !== 0) {
                    // Get Regions for selected group
                    data.defaultRegions.forEach(eachObj => {
                        const regionOverRide = {
                            group: {
                                groupId: selectedGroup.groupId,
                                name: selectedGroup.name,
                                groupType: selectedGroup.groupType
                            },
                            region: {
                                regionId: eachObj['regionId'],
                                name: eachObj['name'],
                                checked: true
                            },
                            exclude: false
                        };

                        // check if region exists in regionOverride
                        const indexInList = this.checkedRegionOverrides.findIndex(
                            x => x.region.regionId === regionOverRide.region.regionId
                            && x.group.groupId === selectedGroup.groupId);
                        // if not then push to region over ride
                        if (indexInList === -1) {
                            this.checkedRegionOverrides.push(regionOverRide);
                        }

                        this.checkedRegionOverrides.forEach(obj => {
                            if ((obj.group.groupId === selectedGroup.groupId) && !obj.exclude) {
                                this.regionList.forEach(region => {
                                    if (region.regionId === obj.region.regionId) {
                                        region.checked = true;
                                    }
                                });
                            }
                        });
                    });

                    this.emptyRegionMessage = false;
                    this.emptyGroupMessage = false;
                }

                // Check if a group has permissions or not
                if (data.defaultPermissions.length !== 0) {
                    // Get Permissions for selected group
                    data.defaultPermissions.forEach(eachObj => {
                        const permissionOverRide = {
                            group: {
                                groupId: selectedGroup.groupId,
                                name: selectedGroup.name,
                                groupType: selectedGroup.groupType
                            },
                            permission: {
                                permissionId: eachObj['permissionId'],
                                name: eachObj['name'],
                                checked: eachObj['name'] !== 'Authorized Contact'
                            },
                            exclude: eachObj['name'] === 'Authorized Contact'
                        };

                        // If permission not in permissionOverRide list then push it to the list
                        const indexInList = this.checkedPermissionOverrides.findIndex(
                            x => x.permission.name === permissionOverRide.permission.name
                            && x.group.groupId === selectedGroup.groupId);
                        // if not then push to permission over ride
                        if (indexInList === -1) {
                            this.checkedPermissionOverrides.push(permissionOverRide);
                        }

                        // If permission not in permission list then push it to the list
                        if (this.permissionList.findIndex(
                                x => x.name === permissionOverRide.permission.name) === -1) {
                            this.permissionList.push(permissionOverRide.permission);
                        }
                    });

                    this.emptyPermissionMessage = false;
                    this.emptyGroupMessage = false;

                    // get regions and permissions for all checked regions
                    this.getRegionPermissions(selectedGroup);
                } else {
                    this.emptyPermissionMessage = true;
                    this.emptyGroupMessage = false;
                    // don't do anything to loader if function called from on ini
                    if (!this.fromOnInit) {
                        this.loaderService.display(false);
                    }
                }
            }, error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
    }

    /**
     * @ngdoc method
     * @name getPayerDetailsByPayerId
     * @methodOf healtheNet.ui.component: AddEditUserComponent
     * @description
     * Call 'getPayerDetail' to fetch regions and permissions for a selected PAYER group
     */
    getPayerDetailsByPayerId(selectedGroup) {
        // don't do anything to loader if function called from on ini
        if (!this.fromOnInit) {
            this.loaderService.display(true);
        }

        // Service Call to Get Payer Permissions
        this.payerDetailsService.getPayerTransactions(selectedGroup.groupId).takeUntil(this.unSubscribe).subscribe(
            data => {
                //  this.cdr.detectChanges();
                // Get Permissions
                if (data.length > 0) {
                    data.forEach(eachObj => {
                        if (eachObj.enabled === true && eachObj.custom === true) {
                            // Check index for Permission ID
                            const indexInList = this.permissionList.findIndex(
                                x => x.permissionId === eachObj.permissionId);

                            if (indexInList === -1) {
                                eachObj.type = 'custom';
                                this.permissionList.push(eachObj);
                            }


                            if (this.permissionList.length === 0) {
                                this.emptyPermissionMessage = true;
                            } else {
                                this.emptyPermissionMessage = false;
                                this.emptyGroupMessage = false;
                            }
                        }
                    });
                } else {
                    this.emptyPermissionMessage = true;
                    this.emptyGroupMessage = false;
                }
                // don't do anything to loader if function called from on ini
                if (!this.fromOnInit) {
                    this.loaderService.display(false);
                }
            }, error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            });
    }

    /**
     * @ngdoc method
     * @name checkRegion
     * @methodOf healtheNet.ui.component: AddEditUserComponent
     * @description
     * Function called When a region is clicked.
     */
    checkRegion(selectedRegion, event) {

        this.loaderService.display(true);
        if (event.checked) {
            this.checkedRegionOverrides.push(selectedRegion);
            this.appendCustomPermissions(selectedRegion);
        } else {
            const index = this.checkedRegionOverrides.findIndex(x => x.regionId === selectedRegion.regionId);
            if (index !== -1) {
                this.checkedRegionOverrides.splice(index, 1);
            }
            this.detachCustomPermissions(selectedRegion);
        }

        this.loaderService.display(false);
    }

    validateRemovedPermissions() {
        const selectedRegs = this.regionList.filter(x => x.checked === true);
        const Ids = [];
        let isReg1Checked = false;
        let isReg4Checked = false;
        let trimmedName = '';
        for (let i = 0; i < selectedRegs.length; i++) {
            Ids.push(selectedRegs[i].regionId);
            trimmedName = selectedRegs[i].name.toUpperCase().replace(/\s/g, '');
            if (trimmedName === 'REG1') {
                isReg1Checked = true;
            } else if (trimmedName === 'REG4') {
                isReg4Checked = true;
            }
        }
        if (Ids.length > 0) {
            this.addEditGroupService.getPermissions(Ids).takeUntil(this.unSubscribe).subscribe(
                data => {
                    if (data.length > 0) {
                        data = this.trimPermissions(data, this.model.role.role);
                        for (let i = 0; i < data.length; i++) {
                            if (data[i].custom) {
                                if (!this.existInDisplayedPermission(data[i].name)) {
                                    if (this.userID === '') {
                                        if (isReg1Checked && data[i].name.toUpperCase() === 'HN_WNY_PRACTICE_USER') {
                                            data[i].checked = true;
                                        } else if (isReg4Checked && data[i].name.toUpperCase() === 'HN_NENY_PRACTICE_USER') {
                                            data [i].checked = true;
                                        } else {
                                            data[i].checked = false;
                                        }

                                    } else {
                                        if (this.existInArray(data[i], this.editPermissionList, 'permission')) {
                                            data[i].checked = true;
                                        }

                                        if (isReg1Checked && data[i].name.toUpperCase() === 'HN_WNY_PRACTICE_USER') {
                                            data[i].checked = true;
                                        } else if (isReg4Checked && data[i].name.toUpperCase() === 'HN_NENY_PRACTICE_USER') {
                                            data [i].checked = true;
                                        }
                                    }
                                    data[i].type = 'custom';
                                    this.permissionList.push(data[i]);
                                }
                            }
                        }
                    }

                },
                error => {
                    console.error(error);
                });
        }
    }

    /**
     * @ngdoc method
     * @name checkSelectedGroup
     * @methodOf healtheNet.ui.component: AddEditUserComponent
     * @description
     * Function called When a group is clicked from search List. Used on click in html view.
     */
    checkSelectedGroup(searchedGroup) {
        searchedGroup.checked = true;
        // remove value from search box after checked clicked
        this.searchValue = '';
        this.searchedGroups = this.displayedUserGroups;
        this.checkGroup(searchedGroup, -2, true);
    }

    /**
     * @ngdoc method
     * @name setGroupToCheckSelectedGroup
     * @methodOf healtheNet.ui.component: AddEditUserComponent
     * @description
     * Function called When a group is selected from search List by pressing enter.
     */
    setGroupToCheckSelectedGroup(groupToCheck) {
        this.closeAuto();
        this.searchedGroups.forEach(eachGroup => {
            if (eachGroup.name === groupToCheck) {
                this.checkSelectedGroup(eachGroup);
            }
        });
    }

    /**
     * @ngdoc method
     * @name checkGroup
     * @methodOf healtheNet.ui.component: AddEditUserComponent
     * @description
     * Display Check if group is clicked or not then display regions.
     */
    checkGroup(selectedGroup, i, checked) {

        if (!checked && this.model.role.role === 'PRACTICE_OFFICE_USER') {
            this.displayedUserGroups.splice(0, this.displayedUserGroups.length);
            this.txtQuery = '';
            return false;
        }
        if (selectedGroup.providerGroupId) {
            selectedGroup.groupId = selectedGroup.providerGroupId;
        }
        this.loaderService.display(true);
        const sortedGroup = [];
        this.selectedGroup = selectedGroup;
        sortedGroup.push(selectedGroup);
        if (this.model.role.role === 'PRACTICE_OFFICE_USER') {
            // for (let x = 0; x < this.displayedUserGroups.length; x++) {
            //     if (this.displayedUserGroups[x].groupId !== this.selectedGroup.groupId) {
            //         this.displayedUserGroups[x].checked = false;
            //         sortedGroup.push(this.displayedUserGroups[x]);
            //     }
            //
            // }
            this.displayedUserGroups.splice(0, this.displayedUserGroups.length);
            this.displayedUserGroups = sortedGroup;
        }


        // If group selected from search list
        if (i === -2) {
            this.selectedIndex = this.displayedUserGroups.findIndex(x => x.groupId === selectedGroup.groupId);
            i = this.selectedIndex;
            this.selectedGroupIndex = this.selectedIndex;
        } else {
            this.selectedIndex = -2;
            this.selectedGroupIndex = i;
        }

        // check if group is in checked group list
        const indexInList = this.checkedGroupList.findIndex(x => x.groupId === selectedGroup.groupId);

        if (selectedGroup.checked === true && indexInList === -1) {
            if (this.model.role.role === 'PRACTICE_OFFICE_USER') {
                this.checkedGroupList = [];
            }

            this.checkedGroupList.push(selectedGroup);
        } else {
            // take out group from list if it is not checked
            this.checkedGroupList.splice(indexInList, 1);
        }
        this.emptyGroupMessage = this.checkedGroupList.length < 1 && !this.selectedGroup;
        if (this.model.role.role !== 'PRACTICE_OFFICE_USER') {
            if (checked) {
                if (this.model.role.role === 'PAYER_USER') {
                    this.attachPermssionByPayer(selectedGroup);
                } else {
                    this.loaderService.display(false);
                }
            } else {
                if (this.model.role.role === 'PAYER_USER') {
                    this.detachPermissionByPayer(selectedGroup);
                } else {
                    this.loaderService.display(false);
                }
            }
        } else {
            this.componentRef.directiveRef.scrollToTop();
            this.loaderService.display(false);
        }

    }

    /**
     * @ngdoc method
     * @name cancelForm
     * @methodOf healtheNet.ui.component: AddEditUserComponent
     * @description
     * Call services to Add/Edit User details
     */
    addEditUser() {
        this.loaderService.display(true);
        const userObject: any = {};
        userObject.role = {
            role: this.model.role.role ? this.model.role.role : null
        };

        const userRole = userObject.role.role;
        const netExchange = 'NETEXCHANGE_ACCOUNT';
        userObject.firstName = (userRole !== netExchange) && this.model.firstName ? this.model.firstName : null;
        userObject.lastName = (userRole !== netExchange) && this.model.lastName ? this.model.lastName : null;
        userObject.dateOfBirth = (userRole !== netExchange) ? moment(this.model.dateOfBirth).format('YYYY-MM-DD') : null;
        userObject.email = (userRole !== netExchange) && this.model.email ? this.model.email : null;
        userObject.pinCode = (userRole !== netExchange) && this.model.pinCode ? this.model.pinCode : null;
        userObject.consentId = (userRole !== netExchange) && this.model.consentId ? this.model.consentId : null;
        userObject.loginId = this.model.loginId ? this.model.loginId : null;
        userObject.password = (userRole === netExchange) && this.model.password ? this.model.password : null;
        userObject.phoneNumber = this.model.phoneNumber ? this.model.phoneNumber : null;
       if (this.deactiveDate !== '' && this.deactiveDate !== undefined && this.deactiveDate !== null) {
           userObject.deactivationDate = moment(this.deactiveDate).format('YYYY-MM-DD');
       } else {
           userObject.deactivationDate = null;
       }
        userObject.enabled = this.model.enabled;
        if (!this.model.enabled) {
           userObject.deactivationDate = moment(new Date()).format('YYYY-MM-DD');
       }
       if (this.model.enabled && !this.previousStatus ) {
           userObject.deactivationDate = null;
       }
        if (userRole === netExchange) {
            userObject.organizationName = this.model.organizationName ? this.model.organizationName : null;
            userObject.systemVendor = this.model.systemVendor ? this.model.systemVendor : null;
            userObject.firstName = this.model.firstName ? this.model.firstName : null;
            userObject.email = this.model.email ? this.model.email : null;
        }
        if (userRole === 'PAYER_USER') {
            userObject.practiceOfficeUserMode = this.practiceOfficeUserMode !== undefined ? this.practiceOfficeUserMode : false;
        }

        if (userRole !== 'LEVEL_2_ADMINISTRATOR' && userRole !== 'LEVEL_1_ADMINISTRATOR') {
            const groups = [];
            this.checkedGroupList.forEach(obj => {
                const uGroup = {
                    groupId: obj.groupId,
                    name: obj.name
                };
                // take out check from the payload
                groups.push(uGroup);
            });
            userObject.userGroups = groups;
            const regions = [];

            this.checkedRegionOverrides.forEach(eachregion => {
                const regionObj: any = {};
                regionObj.region = {regionId: eachregion.regionId, name: eachregion.name};
                regions.push(regionObj);
            });
            userObject.userRegionList = regions;
            const permissions = [];
            this.permissionList.forEach(eachPermission => {
                if (eachPermission.checked) {
                    const permissionObj: any = {};
                    permissionObj.permission = {
                        adxTransaction: eachPermission.adxTransaction,
                        custom: eachPermission.custom,
                        name: eachPermission.name,
                        permissionId: eachPermission.permissionId,
                        transaction: eachPermission.transaction,
                        type: eachPermission.type
                    };
                    permissions.push(permissionObj);
                }
            });
            userObject.userPermissionList = permissions;
        } else {
            userObject.userGroups = [];
            userObject.userRegionList = [];
            userObject.userPermissionList = [];
        }

        if (!this.isEdit) {
            window.scrollTo(0, 0);
            // Add User Service -------------------------------------------------------
            this.addEditUserService.addUser(userObject).takeUntil(this.unSubscribe).subscribe(
                data => {
                    this.router.navigate(['admin/userManagement/read/' + data.userId]);
                    this.loaderService.display(false);
                }, error => {
                    this.loaderService.display(false);
                    this.alertService.error(error.error.errors[0].endUserMessage);
                }
            );
        } else {
            // send user id along with data in edit mode
            userObject.userId = this.model.userId;
            window.scrollTo(0, 0);
            // Edit User Service ---------------------------------------------------------------
            this.addEditUserService.editUser(userObject).takeUntil(this.unSubscribe).subscribe(
                data => {
                    this.router.navigate(['/admin/userManagement/read/' + data.userId]);
                    this.loaderService.display(false);
                }, error => {
                    this.loaderService.display(false);
                    this.alertService.error(error.error.errors[0].endUserMessage);
                }
            );
        }
    }

    /**
     * @ngdoc method
     * @name validateLoginId
     * @methodOf healtheNet.ui.component: AddEditUserComponent
     * @description
     * Call validate Login service to verify user's Login Id.
     */
    validateLoginId() {

        if (this.model.loginId !== undefined && this.model.loginId !== null &&
            this.model.loginId.trim().length > 0 && this.model.loginId !== '') {
            if (this.isEdit && (this.userLoginId === this.model.loginId)) {
                this.loginVerified = true;
                this.invalidLoginID = false;
                this.validationMessage = 'login ID is unique and available.';
            } else {
                this.addEditUserService.validateLoginId(this.model.loginId).takeUntil(this.unSubscribe).subscribe(
                    data => {
                        // change the bool value of the variables when confusion is fixed
                        this.loginVerified = true;
                        this.invalidLoginID = false;
                        this.validationMessage = data.message;
                    }, error => {
                        // display valid message if loginID is same for selected user Id
                        // if (this.isEdit && (this.userLoginId === this.model.loginId)) {
                        //     this.loginVerified = true;
                        //     this.invalidLoginID = false;
                        //     this.validationMessage = 'login ID is unique and available.';
                        // } else {
                        this.loginVerified = false;
                        this.invalidLoginID = true;
                        this.validationMessage = error.error.errors[0].endUserMessage;
                        // }
                    }
                );
            }
        }
    }

    /**
     * @ngdoc method
     * @name validateForm
     * @methodOf healtheNet.ui.component: AddEditUserComponent
     * @description
     * Validate form fields to enable/disable save User Button.
     * Checks for fields with spaces as well.
     */
    validateForm() {
        if (this.model.role.role !== undefined || this.model.role.role !== '') {
            if (this.model.role.role === 'NETEXCHANGE_ACCOUNT') {
                if (this.model.loginId === undefined || this.model.loginId === '' || this.model.loginId === null ||
                    this.model.password === undefined || this.model.password === '' || this.model.password === null) {
                    return true;
                } else {
                    return !(this.model.loginId.trim().length > 0 && this.model.password.trim().length > 7 && !this.invalidLoginID);
                }
            } else {
                if (this.model.firstName === undefined || this.model.firstName === '' || this.model.firstName === null ||
                    this.model.lastName === undefined || this.model.lastName === '' || this.model.lastName === null ||
                    this.model.dateOfBirth === undefined || this.model.dateOfBirth === '' ||
                    this.model.dateOfBirth === null || this.dateErr ||
                    this.model.loginId === undefined || this.model.loginId === '' || this.model.loginId === null) {
                    return true;
                } else {
                    if (this.model.pinCode === undefined || this.model.pinCode === '' || this.model.pinCode === null) {
                        return !(this.model.firstName.trim().length > 1 )
                            && this.model.lastName.trim().length > 1
                            && this.model.dateOfBirth
                            && this.model.loginId.trim().length > 0 && (this.model.loginId.indexOf(' ') === -1)
                            && !this.invalidLoginID ;
                    } else {
                        return !(this.model.firstName.trim().length > 1)
                        && this.model.lastName.trim().length > 1
                        && this.model.dateOfBirth && this.model.pinCode.trim().length === 4
                        && this.model.loginId.trim().length > 0 && (this.model.loginId.indexOf(' ') === -1)
                        && !this.invalidLoginID;
                    }
                }
            }
        } else {

            return true;
        }
    }

    handledate(e) {
        return isNumberKey(e, e.target);
    }

    validateDate(e) {
        this.dateErr = false;
        if (isValidDate(e.target.value)) {
            // if (e.target.value.charAt(4) === '/') {
            //     e.target.value = e.target.value.substring(0,3) + '0' +
            //             e.target.value.substring(3);
            // }

            const d = new Date(e.target.value);
            const minDate = new Date('01/01/1900');
            if (d.getTime() < minDate.getTime()) {
                this.dateErr = true;
                this.dateMsg = 'Date should be greater or equals to 01/01/1900';
            } else if (d.getTime() > new Date().getTime()) {
                this.dateErr = true;
                this.dateMsg = 'Date should be less than current date';
            } else {
                this.dateErr = false;
            }
        } else {
            this.dateErr = true;
            this.dateMsg = 'Invalid date.';
        }
    }

    validateDeactivationDate(e) {
        this.ddateErr = false;
        if (e.target.value !== '') {
            if (!!isValidDate(e.target.value)) {

                this.ddateErr = true;
                this.ddateMsg = 'Invalid date.';
            }
        } else {
            this.ddateErr = false;
            this.ddateMsg = '';
        }

    }



    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }

    // fetch custom transaction from region and add them to permissionlist
    appendCustomPermissions(region) {

        const regionIds = [];
        let regionName = region.name.toUpperCase().replace(/\s/g, '');
        regionIds.push(region.regionId);
        this.addEditGroupService.getPermissions(regionIds).takeUntil(this.unSubscribe).subscribe(
            data => {
                if (data.length > 0) {
                    data = this.trimPermissions(data, this.model.role.role);
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].custom) {
                            if (!this.existInDisplayedPermission(data[i].name)) {
                                if (this.userID === '') {
                                    if ((regionName === 'REG1' || regionName === 'REGION1')
                                        && data[i].name.toUpperCase() === 'HN_WNY_PRACTICE_USER') {
                                        data[i].checked = true;
                                    } else if ((regionName === 'REG4' || regionName === 'REGION4')
                                        && data[i].name.toUpperCase() === 'HN_NENY_PRACTICE_USER') {
                                        data [i].checked = true;
                                    } else {
                                        data[i].checked = false;
                                    }

                                } else {
                                    if (this.existInArray(data[i], this.editPermissionList, 'permission')) {
                                        data[i].checked = true;
                                    }

                                    if ((regionName === 'REG1' || regionName === 'REGION1')
                                        && data[i].name.toUpperCase() === 'HN_WNY_PRACTICE_USER') {
                                        data[i].checked = true;
                                    } else if ((regionName === 'REG4' || regionName === 'REGION4')
                                        && data[i].name.toUpperCase() === 'HN_NENY_PRACTICE_USER') {
                                        data [i].checked = true;
                                    }
                                }
                                data[i].type = 'custom';
                                this.permissionList.push(data[i]);
                            } else {
                                if (regionName === 'REG1' || regionName === 'REGION1') {
                                    for (let i = 0; i < this.permissionList.length; i++) {
                                        if (this.permissionList[i].name.toUpperCase() === 'HN_WNY_PRACTICE_USER') {
                                            this.permissionList[i].checked = true;
                                            break;
                                        }
                                    }
                                }
                                if (regionName === 'REG4' || regionName === 'REGION4') {
                                    for (let i = 0; i < this.permissionList.length; i++) {
                                        if (this.permissionList[i].name.toUpperCase() === 'HN_NENY_PRACTICE_USER') {
                                            this.permissionList[i].checked = true;
                                            break;
                                        }
                                    }
                                }

                            }
                        }
                    }
                }

            },
            error => {
                console.error(error);
            }
        );
    }

    existInDisplayedPermission(name) {
        let result = false;
        for (let i = 0; i < this.permissionList.length; i++) {
            if (this.permissionList[i].name.toString() === name) {
                result = true;
                break;
            }
        }
        return result;
    }

    detachCustomPermissions(region) {
        const regionIds = [];
        regionIds.push(region.regionId);
        this.addEditGroupService.getPermissions(regionIds).takeUntil(this.unSubscribe).subscribe(
            data => {

                if (data.length > 0) {
                    data = this.trimPermissions(data, this.model.role.role);
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].custom) {
                            const index = this.permissionList.findIndex(
                                x => x.permissionId === data[i].permissionId);
                            if (index !== -1) {
                                this.permissionList.splice(index, 1);
                            }
                        }
                    }
                }
                this.validateRemovedPermissions();

            },
            error => {
                console.error(error);
            }
        );
    }

    attachPermssionByPayer(payer) {

        if (this.permissionList.filter(x => x.name === 'Provider Inquiry').length === 0) {
            const currentPayer = this.userGroupsList.filter(x => x.payerId === payer.groupId);
            if (currentPayer[0].payerIdCode === '00801' || currentPayer[0].payerIdCode === '00800') {
                this.removedPermission.type = 'Payer User Available';
                this.removedPermission.checked = this.editPermissionList.length > 0
                    ?this.existInArray(this.removedPermission , this.editPermissionList, 'permission') : true;
                this.permissionList.splice(this.removedFromIndex, 0, this.removedPermission);
            }
        }
        this.payerDetailsService.getPayerTransactions(payer.groupId).takeUntil(this.unSubscribe).subscribe(
            data => {
                // this.cdr.detectChanges();
                if (data.length > 0) {
                    data = this.trimPermissions(data , this.model.role.role);
                    data.forEach(eachObj => {
                        if (eachObj.enabled === true && eachObj.custom === true) {
                            // Check index for Permission ID
                            const indexInList = this.permissionList.findIndex(
                                x => x.permissionId === eachObj.permissionId);

                            if (indexInList === -1) {
                                eachObj.type = 'custom';
                                if (this.userID === '') {
                                    eachObj.checked = false;
                                } else {
                                    if (this.existInArray(eachObj, this.editPermissionList, 'permission')) {
                                        eachObj.checked = true;
                                    } else {
                                        eachObj.checked = false;
                                    }
                                }
                                this.permissionList.push(eachObj);
                            }


                            if (this.permissionList.length === 0) {
                                this.emptyPermissionMessage = true;
                            } else {
                                this.emptyPermissionMessage = false;
                                this.emptyGroupMessage = false;
                            }
                        }
                    });
                }
                // // don't do anything to loader if function called from on ini
                // if (!this.fromOnInit) {
                this.loaderService.display(false);
                // }
            }, error => {
                this.loaderService.display(false);
                // this.alertService.error(error.error.errors[0].endUserMessage);
            });
    }

    detachPermissionByPayer(payer) {
        const checkedGroups = this.displayedUserGroups.filter(x => x.checked);
        if (checkedGroups.length === 0) {
            const currentPayer = this.userGroupsList.filter(x => x.payerId === payer.groupId);
            if (currentPayer[0].payerIdCode === '00801' || currentPayer[0].payerIdCode === '00800') {
                this.permissionList.splice(this.removedFromIndex, 1);
            }
        } else {
            let anotherGroupWithSameCodeExists = false;
            for (let j = 0 ; j < checkedGroups.length; j++) {
             const thisPayer = this.userGroupsList.filter(x => x.payerId === checkedGroups[j].groupId);
             if (thisPayer[0].payerIdCode === '00801' || thisPayer[0].payerIdCode === '00800') {
                 anotherGroupWithSameCodeExists = true;
                 break;
             }
         }
            if (!anotherGroupWithSameCodeExists) {
                this.permissionList.splice(this.removedFromIndex, 1);
            }
        }

        this.payerDetailsService.getPayerTransactions(payer.groupId).takeUntil(this.unSubscribe).subscribe(
            data => {
                // this.cdr.detectChanges();
                if (data.length > 0) {

                    for (let i = 0; i < data.length; i++) {
                        if (data[i].custom) {
                            const index = this.permissionList.findIndex(
                                x => x.permissionId === data[i].permissionId);
                            if (index !== -1) {
                                this.permissionList.splice(index, 1);
                            }
                        }
                    }
                }
                this.loaderService.display(false);
            }, error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            });

    }

    loadPermissions() {
        if (this.model.role.role !== 'LEVEL_1_ADMINISTRATOR' && this.model.role.role !== 'LEVEL_2_ADMINISTRATOR') {
            const role = this.model.role.role === 'PRACTICE_OFFICE_USER' ? 'Practice Office User' : 'Payer User';
            this.addEditUserService.getPermissionByRole(role).takeUntil(this.unSubscribe).subscribe(
                data => {
                    this.permissionList = data;

                    this.permissionList.forEach(obj => {
                        if (obj.type.indexOf('Active') !== -1) {
                            obj.checked = true;
                        } else {
                            obj.checked = false;
                        }
                        const tempList = this.permissionList;
                        this.permissionList = [];
                        for (let i = 0; i < tempList.length; i++) {
                            if (tempList[i].type.indexOf('Active') !== -1) {
                                this.permissionList.push(tempList[i]);
                            }
                        }

                        // if (this.model.role.role !== 'NETEXCHANGE_ACCOUNT') {
                        for (let i = 0; i < tempList.length; i++) {
                            if (tempList[i].type.indexOf('Active') === -1) {
                                this.permissionList.push(tempList[i]);
                            }
                        }
                        // }
                    });
                    if (this.model.role.role === 'NETEXCHANGE_ACCOUNT') {
                        const selectedList = [];
                        this.permissionList.forEach((eachObj) => {
                            eachObj.checked = false;
                            if (this.netExchangePermissions.includes(eachObj.name)) {
                                selectedList.push(eachObj);
                            }
                        });
                        this.permissionList = selectedList;
                    }
                    if (this.model.role.role === 'PAYER_USER') {
                        for (let i = 0; i < this.permissionList.length; i++) {
                            if (this.permissionList[i].name === 'Provider Inquiry') {
                                this.removedFromIndex = i;
                                this.removedPermission = this.permissionList[i];
                                this.permissionList.splice(i, 1);
                                break;
                            }
                        }
                    }
                    this.emptyPermissionMessage = false;
                }, error => {
                    this.emptyPermissionMessage = true;

                    this.alertService.error(error.error.errors[0].endUserMessage);
                }
            );
        }

    }

    checkSelectedGroupsRegionsPermissions(data) {

        if (this.regionList) {
            this.previousRegions = data.userRegionList;
            for (let i = 0; i < this.regionList.length; i++) {
                if (this.existInArray(this.regionList[i], data.userRegionList, 'region')) {
                    this.regionList[i].checked = true;
                    this.appendCustomPermissions(this.regionList[i]);
                    this.checkedRegionOverrides.push(this.regionList[i]);

                }
            }
        }

        if (this.displayedUserGroups) {
            for (let i = 0; i < this.displayedUserGroups.length; i++) {
                if (this.existInArray(this.displayedUserGroups[i], data.userGroups, 'group')) {
                    this.displayedUserGroups[i].checked = true;
                    this.checkedGroupList.push(this.displayedUserGroups[i]);
                    if (this.model.role.role === 'PAYER_USER') {
                        this.attachPermssionByPayer(this.displayedUserGroups[i]);
                    }
                }
            }
            if (this.model.role.role === 'PRACTICE_OFFICE_USER') {
                const checkedArray = [];
                const uncheckedArray = [];
                this.displayedUserGroups.forEach((eachGrp) => {
                    if (eachGrp.checked) {
                        checkedArray.push(eachGrp);
                    } else {
                        uncheckedArray.push(eachGrp);
                    }

                });

                this.displayedUserGroups = checkedArray.concat(uncheckedArray);
            }

        }

        if (this.permissionList) {

            for (let i = 0; i < this.permissionList.length; i++) {
                if (this.existInArray(this.permissionList[i], data.userPermissionList, 'permission')) {
                    this.permissionList[i].checked = true;
                }
            }
        }
    }

    existInArray(valuetoCheck, array, type) {

        let result = false;
        if (type === 'region') {
            for (let j = 0; j < array.length; j++) {
                if (valuetoCheck.regionId === array[j].region.regionId) {
                    result = true;
                    break;
                }
            }
        }
        if (type === 'group') {
            for (let j = 0; j < array.length; j++) {
                if (valuetoCheck.groupId === array[j].groupId) {
                    result = true;
                    break;
                }
            }
        }
        if (type === 'permission') {
            for (let j = 0; j < array.length; j++) {
                if (valuetoCheck.permissionId === array[j].permission.permissionId) {
                    result = true;
                    break;
                }
            }
        }

        return result;
    }

    generatePassword() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz!@#$-_';
        let randomstring = '';
        for (let i = 0; i < 10; i++) {
            const rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum, rnum + 1);
        }
        this.model.password = randomstring;
        this.type = 'text';
    }

    // triggers next on key press
    onFieldChange(query: string) {
        this.txtQueryChanged.next(query);
    }

    // search for ICD-10 code
    onSearchChange(searchValue: string) {
        if (searchValue !== '' && searchValue.length > 0) {
            this.groupListService.getGroupsByName(searchValue).takeUntil(this.unSubscribe).subscribe(response => {
                this.searchedGroups = response;
            });
        } else {
            this.searchedGroups = null;

        }

    }

    trimPermissions(data, role) {
        console.log(data);
        let result = [];
        if (role === 'PRACTICE_OFFICE_USER') {
            for (let i = 0; i < data.length; i++) {
                if (data[i].name.toLowerCase().indexOf('payer') === -1) {
                    result.push(data[i]);
                }
            }
        } else {
            for (let i = 0; i < data.length; i++) {
                if (data[i].name.toLowerCase().indexOf('care') === -1 && data[i].name.toLowerCase().indexOf('practice') === -1
                && data[i].name.toLowerCase().indexOf('physician') === -1 ) {
                    result.push(data[i]);
                }
            }
        }
        return result;

    }

}
