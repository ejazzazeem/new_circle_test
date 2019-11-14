import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../_guards/index';
import {ReferralAuthComponent} from './referral-auth.component';
import {ReferralAuthDetailsComponent} from './referral-auth-details';
import {ReferralAuthInquiryComponent} from './referral-auth-inquiry';
import {ReferralAuthMultiResponseComponent} from './referral-auth-multi-response';

/**
  Claim Status routes
 * @author Umair Yasin
 */
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ReferralAuthComponent,
        canActivate: [AuthGuard],
        children: [
            {
              path: 'detail',
              component: ReferralAuthDetailsComponent
            },
            {
              path: 'inquiry',
              component: ReferralAuthInquiryComponent
            },
            {
              path: 'multi-response',
              component: ReferralAuthMultiResponseComponent
            }
        ]
      }
    ])
  ],
  exports: [RouterModule]
})
export class ReferralAuthRoutingModule { }
