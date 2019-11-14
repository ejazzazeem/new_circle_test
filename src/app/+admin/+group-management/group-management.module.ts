import {NgModule} from '@angular/core';
import {GroupManagementRoutingModule} from './group-management.routing';
import {GroupManagementComponent} from './group-management.component';
import {SharedModule} from '../../+shared-module/shared.module';
import {AddGroupComponent} from './add-edit-group';
import {ViewAllGroupsComponent} from './view-all-groups';
import {ReadGroupDetailsComponent} from './read-group-details';
import {AddEditGroupService, DeleteGroupService, GetGroupsService, GroupListService} from '@services/index';
/**
  Group Management Module to handle group operations
 * @author Umair Yasin
 */
@NgModule({
  imports: [
    SharedModule,
    GroupManagementRoutingModule,
  ],
  declarations: [
    GroupManagementComponent,
    AddGroupComponent,
    ViewAllGroupsComponent,
    ReadGroupDetailsComponent
  ],
  providers : [
    GroupListService,
    GetGroupsService,
    AddEditGroupService,
    DeleteGroupService
  ]
})
export class GroupManagementModule {

}
