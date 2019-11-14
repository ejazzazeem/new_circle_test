import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AddEditUserComponent } from './add-edit-user/index';
import { ReadUserDetailsComponent } from './read-user-details/index';
import { ViewAllUsersComponent } from './view-all-users/index';
import { AuthGuard } from '../../_guards/index';
import { UserManagementComponent } from './user-management.component';

/**
  User Management routes
 * @author Umair Yasin
 */
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: UserManagementComponent,
        canActivate: [AuthGuard],
        children: [
            {
              path: 'add',
              component: AddEditUserComponent
            },
            {
              path: 'read/:id',
              component: ReadUserDetailsComponent
            },
            {
              path: 'update/:id',
              component: AddEditUserComponent
            },
            {
              path: '',
              component: ViewAllUsersComponent
            }
        ]
      }
    ])
  ],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
