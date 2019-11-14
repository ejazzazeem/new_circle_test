import {
  NgModule,
  Optional,
  SkipSelf,
  ModuleWithProviders,
} from '@angular/core';
import { BatchHandlerService } from '@services/client/batch-handler.service';
import { ClaimStatusService } from '@services/client/claim-status.service';
import { ConsentService } from '../../services/client/consent.service';
import { DataSharingService } from '@services/client/data-sharing.service';
import { DisclaimerService } from '@services/client/disclaimer.service';
import { EligibilityService } from '@services/client/eligibility.service';
import { ProviderService } from '@services/client/provider.service';
import { ReferralAuthService } from '@services/client/referral-auth.service';
import { ReferralRequestService } from '@services/client/referral-request.service';

@NgModule({
  declarations: [],
  imports: [],
  providers: [],
})
export class ClientServicesModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: ClientServicesModule
  ) {
    if (parentModule) {
      throw new Error(
        'ClientServicesModule is already loaded. Import it in the AppModule only'
      );
    }
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ClientServicesModule,
      providers: [
        BatchHandlerService,
        ClaimStatusService,
        ConsentService,
        DataSharingService,
        DisclaimerService,
        EligibilityService,
        ProviderService,
        ReferralAuthService,
        ReferralRequestService,
      ],
    };
  }
}
