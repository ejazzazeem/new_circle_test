import {Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { MatDialog } from '@angular/material';
import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';
import { GroupAddModel , State, GroupAddress } from '@models/index';
import { AddEditGroupService, AlertService } from '@services/index';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
declare function isZip(e, target): any;
import {isNullOrUndefined} from 'util';
@Component({
  selector: 'app-add-group',
  templateUrl: './add-edit-group.component.html',
  styleUrls: ['./add-edit-group.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class AddGroupComponent implements OnInit, OnDestroy {
    model: any = {} ;
    states: State[];
    zipError = false;
    regions = [];
    selectedRegions = [];
    permissions =  [];
    selectedPermissions = [];
    groupId = '';
    groupData: any = {};
    groupAddress: GroupAddress = {} as GroupAddress;
    title = 'Add New Group';

    // new logic regions and permissions
    displayedPermission = [];
    private unSubscribe = new Subject();

    constructor(public dialog: MatDialog,
                private addEditGroupService: AddEditGroupService,
                private route: ActivatedRoute,
                private alertService: AlertService,
                private router: Router,
                private cdr: ChangeDetectorRef) { }

  ngOnInit() {

      this.groupId = this.route.snapshot.paramMap.get('id');
        this.addEditGroupService.getStates().takeUntil(this.unSubscribe).subscribe(
        data => {
          this.states = data;
            this.cdr.detectChanges();
        },
        error => {
            this.alertService.error(error.error.errors[0].endUserMessage);
            }
         );

    this.addEditGroupService.getRegions().takeUntil(this.unSubscribe).subscribe(
        data => {
            this.cdr.detectChanges();
          for (let i = 0; i < data.length; i++) {
              this.regions.push({regionId: data[i].regionId , name: data[i].name, checked: false, className: 'single-region' });
          }
        },
        error => {
            this.alertService.error(error.error.errors[0].endUserMessage);
        }
    );
  this.model.status = true;
   if (this.groupId !== '' && this.groupId !== null) {
       this.title = 'Edit Group';
       this.addEditGroupService.getGroupById(this.groupId).takeUntil(this.unSubscribe).subscribe(
           data => {
               this.groupData = data;
               this.cdr.detectChanges();
                this.model.name = this.groupData.name;
                this.model.status = (this.groupData.status === 'ACTIVE');
                this.model.description = this.groupData.description;
               if (this.groupData.address !== null) {
                   this.groupAddress = this.groupData.address;
                   this.model.address = this.groupAddress;
                   this.model.line1 = this.groupData.address.line1;
                   this.model.line2 = this.groupData.address.line2;
                   this.model.city = this.groupData.address.city;
                   this.model.zipCode = this.groupData.address.zipCode;
                   this.model.state = this.groupData.address.state;
                   this.model.county = this.groupData.address.county;
                   this.model.region = this.groupData.address.region;
               }

                 this.selectedRegions = [];
                 this.selectedPermissions = [];
           },
           error => {
               this.alertService.error(error.error.errors[0].endUserMessage);
           }
       );
   }

  }

  openDialog() {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Cancel',
        message: 'Are you sure you want to cancel ?',
        componentName: 'AddGroupComponent'
      }
    });

  }

    saveGroup() {
        const groupObject: GroupAddModel = {} as GroupAddModel;
        groupObject.name = this.model.name;
        groupObject.status = this.model.status ? 'ACTIVE' : 'INACTIVE';
        groupObject.description = (this.model.description === '') ? null : this.model.description;
        const regions = [];
        for (let i = 0; i < this.selectedRegions.length ; i++) {

            regions.push({'regionId': this.selectedRegions[i].regionId , 'name' : this.selectedRegions[i].name });
        }
        const permissions = [];
        if (this.displayedPermission.length !== 0) {
            for (let i = 0; i < this.selectedPermissions.length ; i++) {
                this.displayedPermission.forEach(obj => {
                    if (obj.name === this.selectedPermissions[i].name) {
                        permissions.push({'permissionId': this.selectedPermissions[i].permissionId,
                            'name' : this.selectedPermissions[i].name,
                            'custom' : this.selectedPermissions[i].custom,
                            'adxTransaction' : this.selectedPermissions[i].adxTransaction});
                    }
                });
            }
        }

        groupObject.defaultRegions = regions;
        groupObject.defaultPermissions = permissions;
        /*this.model.zipCode = this.model.zipCode.replace(/[-]/g, '');*/
        this.groupAddress.line1 = (this.model.line1 === '') ? null : this.model.line1;
        this.groupAddress.line2 = (this.model.line2 === '') ? null : this.model.line2;
        this.groupAddress.city = (this.model.city === '') ? null : this.model.city;
        this.groupAddress.zipCode = (this.model.zipCode === '') ? null : this.model.zipCode;
        this.groupAddress.state = (this.model.state === '') ? null : this.model.state;
        this.groupAddress.county = (this.model.county === '') ? null : this.model.county;
        this.groupAddress.region = (this.model.region === '') ? null : this.model.region;
        groupObject.address = this.groupAddress;
        window.scrollTo(0, 0);

        if (this.groupId === null || this.groupId === '') {

            this.addEditGroupService.createGroup(groupObject).takeUntil(this.unSubscribe).subscribe(
                data => {
                   if (data.providerGroupId !== undefined && data.providerGroupId !== null) {
                       this.router.navigate(['admin/groupManagement/read/' + data.providerGroupId]);
                   } else {
                       this.alertService.error('Some error occured while adding group.');
                   }
                },
                error => {
                    this.alertService.error(error.error.errors[0].endUserMessage);
                }
            );
        } else {
            groupObject.providerGroupId = this.groupId;
            this.addEditGroupService.updateGroup(groupObject).takeUntil(this.unSubscribe).subscribe(
                data => {

                    if (data.providerGroupId !== undefined && data.providerGroupId !== null) {
                        this.router.navigate(['admin/groupManagement/read/' + data.providerGroupId]);
                    } else {
                        this.alertService.error('Some error occured while updating group.');
                    }
                },
                error => {
                    this.alertService.error(error.error.errors[0].endUserMessage);
                }
            );
        }
    }

    validateForm() {
        if (this.model.name !== undefined && this.model.zipCode === undefined) {
            return !(this.model.name.trim().length > 1);
        }
        if (!isNullOrUndefined(this.model.zipCode )) {
                if (this.model.zipCode.length === 0 || this.model.zipCode.length === 5 || this.model.zipCode.length === 10) {
                    this.zipError = false;
                    return false;
                } else {
                    this.zipError = true;
                    return true;
                }
        } else {
            return false;
        }

    }


    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }

    handleZip(e) {
        return isZip(e, e.target);
    }


}
