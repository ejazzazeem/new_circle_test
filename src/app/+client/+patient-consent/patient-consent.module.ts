import { NgModule } from '@angular/core';
import { PatientConsentRoutingModule } from './patient-consent.routing';
import { PatientConsentComponent } from './patient-consent.component';
import { SharedModule } from '../../+shared-module/shared.module';
import { ConsentWebformComponent } from './consent-webform';

/**
 * @author mmubasher
 */
@NgModule({
  imports: [
    SharedModule,
    PatientConsentRoutingModule
  ],
  declarations: [
    PatientConsentComponent,
    ConsentWebformComponent,
  ],
  entryComponents: [],
  providers: []
})
export class PatientConsentModule {

}
