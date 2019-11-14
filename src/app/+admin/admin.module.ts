import {NgModule} from '@angular/core';
import {AdminRoutingModule} from './admin.routing';
import {SharedModule} from '../+shared-module/shared.module';
import {SideMenuAdminComponent} from '@misc/admin/side-menu-admin';
import {AdminComponent} from './admin.component';
/**
 Admin parent module which contains all modules which are visible to admin
 * @author Umair Yasin
 */
@NgModule({
  imports: [
    SharedModule,
    AdminRoutingModule,
  ],
  declarations: [
    AdminComponent
  ]
})
export class AdminModule {

}
