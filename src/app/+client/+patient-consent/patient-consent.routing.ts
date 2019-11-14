import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../_guards';
import { PatientConsentComponent } from './patient-consent.component';
import { ConsentWebformComponent } from './consent-webform/consent-webform.component';

/**
 Patient Consent routes
 * @author mmubasher
 */
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: PatientConsentComponent,
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            component: ConsentWebformComponent,
          },
        ]
      }
    ])
  ],
  exports: [RouterModule]
})
export class PatientConsentRoutingModule {
}
