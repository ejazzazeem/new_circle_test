import { Routes, RouterModule } from '@angular/router';
import {ClientComponent} from './client.component';
import {AuthGuard, DisclaimerGuard} from '../_guards';
import {HomeComponent} from './home';
import {DisclaimerComponent} from './disclaimer';
import { EligibilityPrintComponent } from './print-preview/eligibility-print/eligibility-print.component';


const appRoutes: Routes = [

  /* Claim Status */
  {
    path: 'claim-status',
    component: ClientComponent,
    loadChildren: 'app/+client/+claim-status/claim-status.module#ClaimStatusModule'
  },
  /* Eligibility */
  {
    path: 'eligibility',
    component: ClientComponent,
    loadChildren: 'app/+client/+eligibility/eligibility.module#EligibilityModule'
  },
  /* Provider Inquiry */
  {
    path: 'provider-inquiry',
    component: ClientComponent,
    loadChildren: 'app/+client/+provider/provider.module#ProviderModule'
  },
  /* Referral */
  {
    path: 'referral',
    component: ClientComponent,
    loadChildren: 'app/+client/+referral/referral.module#ReferralModule'
  },
  /* Referral Auth*/
  {
    path: 'referral-auth',
    component: ClientComponent,
    loadChildren: 'app/+client/+referral-auth/referral-auth.module#ReferralAuthModule'
  },
  /* Patient Consent*/
  {
    path: 'patient-consent',
    component: ClientComponent,
    loadChildren: 'app/+client/+patient-consent/patient-consent.module#PatientConsentModule'
  },
  /* Home Page*/
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard, DisclaimerGuard] },

  { path: 'disclaimer', component: DisclaimerComponent, canActivate: [AuthGuard] },

  /* Eligibility Print Preview */
  { path: 'eligibility/print-preview', component: EligibilityPrintComponent, canActivate: [AuthGuard, DisclaimerGuard] },

];

export const ClientRoutingModule = RouterModule.forChild(appRoutes);
