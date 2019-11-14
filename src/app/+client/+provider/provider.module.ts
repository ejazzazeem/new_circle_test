import {NgModule} from '@angular/core';
import {ProviderRoutingModule} from './provider.routing';
import {ProviderComponent} from './provider.component';
import {SharedModule} from '../../+shared-module/shared.module';
import {ProviderInquiryComponent, ProviderInquiryDetailsComponent, ProviderInquiryStatusComponent,
ProviderInquiryMultiResponseComponent} from './index';
import {ProviderService, PayerDetailsService} from '@services/index';
import {MessageDialogComponent} from '@misc/index';
import { ScrollToModule } from 'ng2-scroll-to';
import {MatProgressBarModule} from '@angular/material/progress-bar';
/**
 Provider Module
 * @author Umair Yasin
 */
@NgModule({
  imports: [
    SharedModule,
    ProviderRoutingModule,
    ScrollToModule,
    MatProgressBarModule
  ],
  declarations: [
    ProviderComponent,
    ProviderInquiryComponent,
    ProviderInquiryDetailsComponent,
    ProviderInquiryStatusComponent,
    ProviderInquiryMultiResponseComponent,
    MessageDialogComponent
  ],
  providers: [
    ProviderService,
    PayerDetailsService
  ],
  entryComponents: [
    MessageDialogComponent
  ],
})
export class ProviderModule {

}
