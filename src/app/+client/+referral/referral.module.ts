import {NgModule} from '@angular/core';
import {ReferralRoutingModule} from './referral.routing';
import {ReferralComponent} from './referral.component';
import {SharedModule} from '../../+shared-module/shared.module';
import {ReferralRequestFormComponent} from './referral-request-form';
import {ReferralResponseComponent} from './referral-response';
import {ReferralRequestService, PayerDetailsService} from '@services/index';
import { ScrollToModule } from 'ng2-scroll-to';
/**
 Referral Module
 * @author Umair Yasin
 */
@NgModule({
  imports: [
    SharedModule,
    ReferralRoutingModule,
    ScrollToModule
  ],
  declarations: [
    ReferralComponent,
    ReferralRequestFormComponent,
    ReferralResponseComponent,
  ],
  providers: [
    ReferralRequestService,
    PayerDetailsService
  ]
})
export class ReferralModule {

}
