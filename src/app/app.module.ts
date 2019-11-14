import { APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AlertModule } from 'ngx-bootstrap';
import { CookieModule } from 'ngx-cookie';
import {
  MatInputModule,
  MatButtonModule,
  MatDatepickerModule,
  MatFormFieldModule,
  MatDialogModule,
} from '@angular/material';

// Custom scrollbar
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

import { AlertComponent } from '@misc/index';

import { BaseRequestOptions, HttpModule } from '@angular/http';

// importing components
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/index';
import { RootComponent } from './components/root/index';

// Common components
import { AppRoutingModule } from './app.routing';
import { AuthGuard, TestLoginAuthGuard } from './_guards/index';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SwitchConfirmComponent } from '@misc/index';
// importing services
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  AuthenticationService,
  AlertService,
  ConfigService,
  FooterService,
  PrivilegeService,
  CurrentUserService,
  ConsentService,
  LoaderService,
  GetRegionsService,
  UserSessionService,
  SetHeaderInterceptorService,
  DataSharingService,
  UtilsService,
} from '@services/index';
import { environment } from '../environments/environment';
import { ScrollToModule } from 'ng2-scroll-to';
import { ClientServicesModule } from './services/client/client-services.module';
import { NgIdleModule } from '@ng-idle/core';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RootComponent,
    AlertComponent,
    SwitchConfirmComponent,
  ],
  imports: [
    BrowserModule,
    AlertModule.forRoot(),
    CookieModule.forRoot(),
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    NoopAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    ScrollToModule.forRoot(),
    NgxDatatableModule,
    ClientServicesModule.forRoot(),
    AppRoutingModule,
    NgIdleModule.forRoot()
  ],
  providers: [
    ConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: ConfigLoader,
      deps: [ConfigService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SetHeaderInterceptorService,
      multi: true,
    },
    AuthGuard,
    FooterService,
    TestLoginAuthGuard,
    PrivilegeService,
    CurrentUserService,
    // ConsentService,
    AlertService,
    DatePipe,
    AuthenticationService,
    LoaderService,
    GetRegionsService,
    UserSessionService,
    // DataSharingService,
    UtilsService,
    BaseRequestOptions,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
  ],
  entryComponents: [SwitchConfirmComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}

export function ConfigLoader(configService: ConfigService) {
  return () => configService.load(environment.configFile);
}
