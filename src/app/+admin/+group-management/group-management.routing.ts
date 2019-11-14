import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../_guards/index';
import {GroupManagementComponent} from './group-management.component';
import {AddGroupComponent} from './add-edit-group';
import {ViewAllGroupsComponent} from './view-all-groups';
import {ReadGroupDetailsComponent} from './read-group-details';

/**
  Payer Management routes
 * @author Umair Yasin
 */
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: GroupManagementComponent,
        canActivate: [AuthGuard],
        children: [
            {
              path: 'add',
              component: AddGroupComponent
            },
            {
              path: 'read/:id',
              component: ReadGroupDetailsComponent
            },
            {
              path: 'update/:id',
              component: AddGroupComponent
            },
            {
              path: '',
              component: ViewAllGroupsComponent
            }
        ]
      }
    ])
  ],
  exports: [RouterModule]
})
export class GroupManagementRoutingModule { }
