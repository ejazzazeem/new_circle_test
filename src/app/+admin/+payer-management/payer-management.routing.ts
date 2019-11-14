import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../_guards/index';
import {PayerManagementComponent} from './payer-management.component';
import {AddPayerComponent} from './add-payer';
import {PayerDetailsComponent} from './payer-details';
import {ViewAllPayersComponent} from './view-all-payers';

/**
  Payer Management routes
 * @author Umair Yasin
 */
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: PayerManagementComponent,
        canActivate: [AuthGuard],
        children: [
            {
              path: 'add',
              component: AddPayerComponent
            },
            {
              path: 'read/:id',
              component: PayerDetailsComponent
            },
            {
              path: 'update/:id',
              component: AddPayerComponent
            },
            {
              path: '',
              component: ViewAllPayersComponent
            }
        ]
      }
    ])
  ],
  exports: [RouterModule]
})
export class PayerManagementRoutingModule { }
