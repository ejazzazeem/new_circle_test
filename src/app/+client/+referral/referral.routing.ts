import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../_guards/index';
import {ReferralComponent} from './referral.component';
import {ReferralRequestFormComponent} from './referral-request-form';
import {ReferralResponseComponent} from './referral-response';

/**
  Claim Status routes
 * @author Umair Yasin
 */
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ReferralComponent,
        canActivate: [AuthGuard],
        children: [
            {
              path: 'request',
              component: ReferralRequestFormComponent
            },
            {
              path: 'response',
              component: ReferralResponseComponent
            }
        ]
      }
    ])
  ],
  exports: [RouterModule]
})
export class ReferralRoutingModule { }
