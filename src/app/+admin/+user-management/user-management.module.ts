import { NgModule } from '@angular/core';
import { UserManagementRoutingModule } from './user-management.routing';
import { UserManagementComponent } from './user-management.component';
import { AddEditUserComponent } from './add-edit-user';
import { ReadUserDetailsComponent } from './read-user-details';
import { ViewAllUsersComponent } from './view-all-users';
import { SharedModule } from '../../+shared-module/shared.module';
import {
  AddEditGroupService,
  AddEditUserService,
  DeleteUserService,
  GetGroupsService,
  GetRegionsService,
  GetUsersService,
  GroupListService,
  PayerDetailsService,
  ViewAllPayersService
} from '@services/index';

/**
 User Management Module to handle user operations
 * @author Umair Yasin
 */
@NgModule({
  imports: [
    SharedModule,
    UserManagementRoutingModule,
  ],
  declarations: [
    UserManagementComponent,
    AddEditUserComponent,
    ReadUserDetailsComponent,
    ViewAllUsersComponent,
  ],
  providers: [
    AddEditUserService,
    GetUsersService,
    DeleteUserService,
    GroupListService,
    ViewAllPayersService,
    GetGroupsService,
    GetRegionsService,
    AddEditGroupService,
    PayerDetailsService
  ]
})
export class UserManagementModule {

}
