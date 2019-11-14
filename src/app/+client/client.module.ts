import {NgModule} from '@angular/core';
import {ClientRoutingModule} from './client.routing';
import {SharedModule} from '../+shared-module/shared.module';
import {SideMenuClientComponent} from '@misc/index';
import {ClientComponent} from './client.component';
import {HomeComponent} from './home/home.component';
import {DisclaimerComponent} from './disclaimer/disclaimer.component';
import {DisclaimerDialogComponent} from '@misc/client/disclaimer-dialog';
import {MatDialogModule} from '@angular/material';
import {DisclaimerGuard} from '../_guards';
import {DisclaimerService, DataSharingService, SharedService} from '@services/index';
import { EligibilityPrintComponent } from './print-preview/eligibility-print/eligibility-print.component';

/**
 Client parent module which contains all modules which are visible to users other than admin
 * @author Umair Yasin
 */
@NgModule({
  imports: [
    SharedModule,
    ClientRoutingModule
  ],
  declarations: [
    ClientComponent,
    HomeComponent,
    DisclaimerComponent,
    DisclaimerDialogComponent,
    EligibilityPrintComponent
  ],
  entryComponents: [
    DisclaimerDialogComponent
  ],
  providers: [
    DisclaimerGuard,
    DisclaimerService,
    DataSharingService,
    SharedService
  ]
})
export class ClientModule {

}
