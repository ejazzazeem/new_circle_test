import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../_guards/index';
import {EligibilityComponent} from './eligibility.component';
import {EligibilityInquiryComponent} from './eligibility-inquiry';
import {EligibilityDetailsComponent} from './eligibility-details';
import {EligibilityResponseComponent} from './eligibility-response';

/**
  Claim Status routes
 * @author Umair Yasin
 */
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: EligibilityComponent,
        canActivate: [AuthGuard],
        children: [
            {
              path: 'inquiry',
              component: EligibilityInquiryComponent
            },
            {
              path: 'detail',
              component: EligibilityDetailsComponent
            },
            {
              path: 'response',
              component: EligibilityResponseComponent
            }
        ]
      }
    ])
  ],
  exports: [RouterModule]
})
export class EligibilityRoutingModule { }
