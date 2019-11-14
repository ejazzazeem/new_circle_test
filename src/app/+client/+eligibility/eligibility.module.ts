import {NgModule} from '@angular/core';
import {EligibilityRoutingModule} from './eligibility.routing';
import {EligibilityComponent} from './eligibility.component';
import {SharedModule} from '../../+shared-module/shared.module';
import {EligibilityInquiryComponent} from './eligibility-inquiry';
import {EligibilityDetailsComponent} from './eligibility-details';
import {EligibilityResponseComponent} from './eligibility-response';
import {EligibilityService, SharedService, PayerDetailsService} from '@services/index';
import { PrintDialogComponent } from './print-dialog/print-dialog.component';
import {CoverageLevel} from '../../shared/pipe/coverage.pipe';
import { ScrollToModule } from 'ng2-scroll-to';
/**
  Eligibility Module
 * @author Umair Yasin
 */
@NgModule({
  imports: [
    SharedModule,
    EligibilityRoutingModule,
    ScrollToModule
  ],
  declarations: [
    EligibilityComponent,
    EligibilityInquiryComponent,
    EligibilityDetailsComponent,
    EligibilityResponseComponent,
    PrintDialogComponent
  ],
  providers: [
    EligibilityService,
    PayerDetailsService
  ],
  entryComponents: [
    PrintDialogComponent
  ]
})
export class EligibilityModule {

}
