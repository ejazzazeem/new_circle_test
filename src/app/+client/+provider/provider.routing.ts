import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../_guards/index';
import {ProviderComponent} from './provider.component';
import {ProviderInquiryComponent} from './provider-inquiry';
import {ProviderInquiryDetailsComponent} from './provider-response';
import {ProviderInquiryStatusComponent} from './provider-inquiry-status';
import {ProviderInquiryMultiResponseComponent} from './provider-inquiry-multi-response';

/**
  Claim Status routes
 * @author Umair Yasin
 */
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ProviderComponent,
        canActivate: [AuthGuard],
        children: [
            {
              path: '',
              component: ProviderInquiryComponent
            },
            {
              path: 'detail',
              component: ProviderInquiryDetailsComponent
            },
            {
              path: 'multi-response',
              component: ProviderInquiryMultiResponseComponent
            },
            {
              path: 'status',
              component: ProviderInquiryStatusComponent
            }
        ]
      }
    ])
  ],
  exports: [RouterModule]
})
export class ProviderRoutingModule { }
