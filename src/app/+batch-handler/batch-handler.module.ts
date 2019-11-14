import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BatchHandlerComponent } from './batch-handler.component';
import { ManagerComponent } from './manager';
import { BatchHandlerRoutingModule } from './batch-handler.routing';
import { BatchHandlerService } from '@services/index';
import {SharedModule} from '../+shared-module/shared.module';

/**
 * @author mmubasher
 */
@NgModule({
  imports: [
    SharedModule,
    BatchHandlerRoutingModule
  ],
  declarations: [
    ManagerComponent,
    BatchHandlerComponent,
  ],
  entryComponents: [],
  providers: [BatchHandlerService],
  exports: [BatchHandlerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BatchHandlerModule {

}
