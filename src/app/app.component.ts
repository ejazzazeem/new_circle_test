import {Component, OnDestroy, OnInit} from '@angular/core';
import { LoaderService } from './services/loader.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import {DEFAULT_INTERRUPTSOURCES, Idle} from '@ng-idle/core';
import {ConfigService} from './services/config/config.service';
import {MatDialog} from '@angular/material';
import {CookieService} from 'ngx-cookie';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'app';
  showLoader: boolean;
  private unSubscribe = new Subject();
  private idleState = 'Not started.';
  private isIdle: boolean;
  private timedOut = false;
  private idleEndCount = 0;
  private idleStartCount = 0;
  testAuth: boolean;
  ssoAuthUrl: string;
  sessionTimeout: any;
  private baseUrl;
  constructor(private loaderService: LoaderService,
              private router: Router,
              private idle: Idle,
              private cookieService: CookieService,
              public dialog: MatDialog,
              private http: HttpClient,
              private configService: ConfigService) {
    // Logout User after Time out/Session End - Start ----------------------------------------------------------
    this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
    this.testAuth = this.configService.getConfiguration().testAuth;
    this.ssoAuthUrl = this.configService.getConfiguration().ssoAuthUrlLanding;

    // sessionTimeout Should always be half that of what is in the backend properties file.
    this.sessionTimeout = parseInt(this.configService.getConfiguration().sessionTimeout, 10);
    this.checkIdleState();
  }

  checkIdleState() {
    this.isIdle = false;

    // sets an idle timeout of 10 minute
    this.idle.setIdle(this.sessionTimeout * 60);
    // after the expiry time has reached due to inactivity, the user will be considered timed out.
    this.idle.setTimeout(this.sessionTimeout * 60);
    // Total Session Timeout is:
    //   idleTime + sessionTimeout  = Logout at this time
    //        10  +  10 = 20 min

    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.idle.onIdleEnd.subscribe(() => {
      this.idleEndCount++;
      this.idleState = 'No longer idle.';

      if (localStorage.getItem('token')) {
        this.http.get(this.baseUrl + 'keepalive').takeUntil(this.unSubscribe).subscribe(
            response => {
              // console.log('Keep Alive Service Call Sent');
            },
            error => {
              console.error(error);
            });
      }
    });

    this.idle.onTimeout.takeUntil(this.unSubscribe).subscribe(() => {
      this.idleState = 'Timed out!';
      this.timedOut = true;
      this.reset();

      this.dialog.closeAll();
      // Close any dialogs if open
      localStorage.clear();
      this.cookieService.remove('SESSION_KEY');
      if (this.testAuth) {
        this.router.navigate(['/login']);
      } else {
        window.location.href = this.ssoAuthUrl;
      }
    });

    this.idle.onIdleStart.subscribe(() => {
      this.idleStartCount++;
      this.idleState = 'You\'ve gone idle!';
    });

    this.idle.onTimeoutWarning.subscribe((countdown) => {
      this.idleState = 'You will time out in ' + countdown + ' seconds!';
    });

    this.reset();
  }

  reset() {
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;
  }

  ngOnInit() {
    this.loaderService.status.takeUntil(this.unSubscribe).subscribe((val: boolean) => {
      window.setTimeout(() => {
        this.showLoader = val;
      });
    });

    // no need to unSubscribe from the router observables
    // Source: https://stackoverflow.com/a/41177163
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

  // unSubscribe the observables to avoid memory leaks
  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
}


