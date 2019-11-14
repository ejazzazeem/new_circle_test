import { Routes, RouterModule } from '@angular/router';
import {AdminComponent} from './admin.component';

const appRoutes: Routes = [

  /* User Management*/
  {
    path: 'userManagement',
    component: AdminComponent,
    loadChildren: 'app/+admin/+user-management/user-management.module#UserManagementModule'
  },
  /* Payer Management*/
  {
    path: 'payerManagement',
    component: AdminComponent,
    loadChildren: 'app/+admin/+payer-management/payer-management.module#PayerManagementModule'
  },
  /* Group Management*/
  {
    path: 'groupManagement',
    component: AdminComponent,
    loadChildren: 'app/+admin/+group-management/group-management.module#GroupManagementModule'
  }
];

export const AdminRoutingModule = RouterModule.forChild(appRoutes);
