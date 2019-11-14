import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../_guards';
import {ManagerComponent} from './manager/manager.component';
import {BatchHandlerComponent} from './batch-handler.component';

/**
 Batch Handler routes
 * @author mmubasher
 */
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: BatchHandlerComponent,
        canActivate: [AuthGuard],
        children: [
          {
            path: 'batch',
            component: ManagerComponent
          }
        ]
      }
    ])
  ],
  exports: [RouterModule]
})
export class BatchHandlerRoutingModule {
}
