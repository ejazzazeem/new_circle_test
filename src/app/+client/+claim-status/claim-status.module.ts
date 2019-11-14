import {NgModule} from '@angular/core';
import {ClaimStatusRoutingModule} from './claim-status.routing';
import {ClaimStatusComponent} from './claim-status.component';
import {SharedModule} from '../../+shared-module/shared.module';
import {ClaimStatusInquiryComponent} from './claim-status-inquiry';
import {ClaimStatusDetailComponent} from './claim-status-detail';
import {ClaimStatusMultiResponseComponent} from './claim-status-multi-response';
import {ClaimStatusService, PayerDetailsService} from '@services/index';
import { ScrollToModule } from 'ng2-scroll-to';
/**
  Claim Status Module to handle claim status operations
 * @author Umair Yasin
 */
@NgModule({
  imports: [
    SharedModule,
    ClaimStatusRoutingModule,
    ScrollToModule
  ],
  declarations: [
    ClaimStatusComponent,
    ClaimStatusInquiryComponent,
    ClaimStatusDetailComponent,
    ClaimStatusMultiResponseComponent,
  ],
  providers: [
    ClaimStatusService,
    PayerDetailsService
  ]
})
export class ClaimStatusModule {

}
