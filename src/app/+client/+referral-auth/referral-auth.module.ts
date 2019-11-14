import {NgModule} from '@angular/core';
import {ReferralAuthRoutingModule} from './referral-auth.routing';
import {ReferralAuthComponent} from './referral-auth.component';
import {SharedModule} from '../../+shared-module/shared.module';
import {ReferralAuthDetailsComponent, ReferralAuthInquiryComponent, ReferralAuthMultiResponseComponent} from './index';
import {ReferralAuthService, SharedService, PayerDetailsService} from '@services/index';
import { ScrollToModule } from 'ng2-scroll-to';
/**
 Referral Auth Module
 * @author Umair Yasin
 */
@NgModule({
  imports: [
    SharedModule,
    ReferralAuthRoutingModule,
    ScrollToModule
  ],
  declarations: [
    ReferralAuthComponent,
    ReferralAuthDetailsComponent,
    ReferralAuthInquiryComponent,
    ReferralAuthMultiResponseComponent
  ],
  providers : [
    ReferralAuthService,
    SharedService,
    PayerDetailsService
  ]
})
export class ReferralAuthModule {

}
