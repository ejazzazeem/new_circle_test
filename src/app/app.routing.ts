import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TestLoginAuthGuard } from './_guards/index';
import { LoginComponent } from './components/login/index';
import { RootComponent } from './components/root/index';

const appRoutes: Routes = [
  { path: '', component: RootComponent, pathMatch: 'full' },

  {
    path: 'login',
    component: LoginComponent,
    canActivate: [TestLoginAuthGuard],
  },

  // otherwise redirect to Page Not Found Page
  // { path: '**', component: PageNotFoundComponent },

  // ************************************ Main App ROUTES - Start ********************************************

  /* Admin Management*/
  {
    path: 'admin',
    loadChildren: 'app/+admin/admin.module#AdminModule',
  },
  /* Client Management*/
  {
    path: 'client',
    loadChildren: 'app/+client/client.module#ClientModule',
  },
  /* Reporting */
  {
    path: 'reporting',
    loadChildren: 'app/+reporting/reporting.module#ReportingModule',
  },
  {
    path: 'batch-handler',
    loadChildren: 'app/+batch-handler/batch-handler.module#BatchHandlerModule',
  },
  // ************************************ Main App ROUTES - End ********************************************
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
