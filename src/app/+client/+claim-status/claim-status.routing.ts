import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../_guards/index';
import {ClaimStatusComponent} from './claim-status.component';
import {ClaimStatusInquiryComponent} from './claim-status-inquiry';
import {ClaimStatusDetailComponent} from './claim-status-detail';
import {ClaimStatusMultiResponseComponent} from './claim-status-multi-response';

/**
  Claim Status routes
 * @author Umair Yasin
 */
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ClaimStatusComponent,
        canActivate: [AuthGuard],
        children: [
            {
              path: 'inquiry',
              component: ClaimStatusInquiryComponent
            },
            {
              path: 'detail',
              component: ClaimStatusDetailComponent
            },
            {
              path: 'multi-response',
              component: ClaimStatusMultiResponseComponent
            }
        ]
      }
    ])
  ],
  exports: [RouterModule]
})
export class ClaimStatusRoutingModule { }
