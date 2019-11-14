import {NgModule} from '@angular/core';
import {ReportingRoutingModule} from './reporting.routing';
import {ReportingComponent} from './reporting.component';
import { SharedService, ReportingService, ViewAllPayersService, GroupListService } from '@services/index';
import { ScrollToModule } from 'ng2-scroll-to';
import {ReportsComponent} from './reports';
import {ActiveUsersComponent, Top100TransactionComponent,
  ActiveProvidersComponent, AuthorizedContactsComponent,
  HighVolumeUsersComponent, ParticipatingProvidersComponent, LoginLogoutDetailsComponent, NetExchangeUsageComponent,
  NoActivityUsersComponent, PracticeFacilityListComponent, TransactionHourAveragesComponent,
  TransactionTotalsComponent, UserListByOrganizationComponent, SaveReportDialogComponent, TransactionSuccessComponent, ConcurrentLoginUsersComponent} from '../shared/misc';
import { TagInputModule } from 'ngx-chips';
import { CollapsibleModule } from 'angular2-collapsible';
import {SharedModule} from '../+shared-module/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ReportPaginationComponent } from '../shared/misc/reporting/report-pagination/report-pagination.component';
import { ChildPagerComponent } from '../shared/misc/reporting/child-pager/child-pager.component';
/**
 Reporting Module
 * @author Zofishan Khalid
 */
@NgModule({
  imports: [
    SharedModule,
    ScrollToModule,
    CollapsibleModule,
    TagInputModule,
    ReportingRoutingModule,
    NgxDatatableModule
  ],
  declarations: [
    ReportsComponent,
    ReportingComponent,
    ActiveUsersComponent,
    Top100TransactionComponent,
    ActiveProvidersComponent,
    AuthorizedContactsComponent,
    HighVolumeUsersComponent,
    LoginLogoutDetailsComponent,
    NetExchangeUsageComponent,
    NoActivityUsersComponent,
    ParticipatingProvidersComponent,
    PracticeFacilityListComponent,
    TransactionHourAveragesComponent,
    TransactionTotalsComponent,
    UserListByOrganizationComponent,
    SaveReportDialogComponent,
    TransactionSuccessComponent,
    ConcurrentLoginUsersComponent,
    ReportPaginationComponent,
    ChildPagerComponent

  ],
  entryComponents: [
    SaveReportDialogComponent
  ],
  providers : [
    SharedService,
    ReportingService,
    ViewAllPayersService,
    GroupListService
]
})
export class ReportingModule {

}
