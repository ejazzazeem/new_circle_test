import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {ReportingComponent } from './reporting.component';
import {ReportsComponent} from './reports';
import {AuthGuard} from '../_guards/auth.guard';

/**
  Reporting Route
 * @author Zofishan Khalid
 */
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ReportingComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'reports',
                component: ReportsComponent
            }
        ]
      }
    ])
  ],
  exports: [RouterModule]
})
export class ReportingRoutingModule { }
