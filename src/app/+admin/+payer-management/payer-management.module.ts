import {NgModule} from '@angular/core';
import {PayerManagementRoutingModule} from './payer-management.routing';
import {PayerManagementComponent} from './payer-management.component';
import {SharedModule} from '../../+shared-module/shared.module';
import {AddPayerComponent} from './add-payer';
import {ViewAllPayersComponent} from './view-all-payers';
import {PayerDetailsComponent} from './payer-details';
import {PayerDetailsService} from '@services/admin/payer-management';
import {ViewAllPayersService, AddPayerService, GetGroupsService} from '@services/index';
import {TransactionSettingsComponent, CustomTransactionDialogComponent, AceEditorDirective} from '@misc/index';

/**
  Payer Management Module to handle payer operations
 * @author Umair Yasin
 */
@NgModule({
  imports: [
    SharedModule,
    PayerManagementRoutingModule,
  ],
  declarations: [
    PayerManagementComponent,
    AddPayerComponent,
    ViewAllPayersComponent,
    PayerDetailsComponent,
    TransactionSettingsComponent,
    AceEditorDirective,
    CustomTransactionDialogComponent
  ],
  providers: [
    AddPayerService,
    ViewAllPayersService,
    PayerDetailsService,
    GetGroupsService
  ],
  entryComponents: [
    TransactionSettingsComponent,
    CustomTransactionDialogComponent
  ],
})
export class PayerManagementModule {

}
