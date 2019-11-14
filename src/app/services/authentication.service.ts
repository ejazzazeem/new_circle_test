import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import 'rxjs/add/operator/map';
import { ConfigService } from './config/config.service';
import { CurrentUserService, UserSessionService } from './auth/index';

// Import constants
import * as constants from '@misc/constant';
import { AlertService } from './alert.service';
import { LoaderService } from './loader.service';

@Injectable()
export class AuthenticationService {
    private baseUrl;
    private testAuth: boolean;
    private ssoAuthUrl: string;
    private sessionCookieName = 'SESSION_KEY';

  constructor(private http: Http,
              private configService: ConfigService,
              private currentUserService: CurrentUserService,
              private userSessionService: UserSessionService,
              private cookieService: CookieService,
              private alertService: AlertService,
              private loaderService: LoaderService,
              private router: Router) {

      // Get URLs
      this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
      this.testAuth = this.configService.getConfiguration().testAuth;
      this.ssoAuthUrl = this.configService.getConfiguration().ssoAuthUrl;
  }

  testLogin(username: string) {
      // this.logout();
      const headers = new Headers({
          'Content-Type': 'application/json'
      });
     return this.http.post(this.baseUrl + 'testauth/authenticate', { username: username }, {headers: headers})
      .map((response: Response) => {
        // login successful if there's a jwt token in the response

          if (response.json().error === undefined) {
              const data = response.json();
              if (data && data.token) {
                  // store jwt token in local storage to keep user logged in between page refreshes
                  localStorage.setItem('token', data.token);
                  // Workaround for when testing service on different port
                  if (!this.cookieService.get(this.sessionCookieName) && data.sessionKey) {
                      const opts: any = {
                          expires: new Date(constants.COOKIE_EXPIRY)
                      };
                      this.cookieService.put(this.sessionCookieName, data.sessionKey, opts);
                  }
              }
          } else {
             return response.json().message;
          }

      });

  }

  logout() {
    this.userSessionService.logout().subscribe(
         data => {
                this.navigateToLogin();
                this.loaderService.display(false);
        },
        error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
                console.error('Error occurred logging out.');
        }
    );
  }

  // Navigate to appropriate login page. Login is used for development purpose.
  // SSO is used for production.
  navigateToLogin() {
      // remove user from local storage to log user out
      localStorage.clear();
      this.currentUserService.clearCurrentUser();
      this.cookieService.remove(this.sessionCookieName);
      if (this.testAuth) {
           this.router.navigate(['/login']);
          // window.location.href = 'login';
      } else {
          window.location.href = this.ssoAuthUrl;
      }
  }

  ensureLogOut() {
      localStorage.clear();
      this.currentUserService.clearCurrentUser();
      this.cookieService.remove(this.sessionCookieName);

  }

}
