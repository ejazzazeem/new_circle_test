import { Injectable, OnInit } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService, CurrentUserService, ConfigService } from '../services';
import { PrivilegeService } from '../services/auth/privileges.service';
import { CurrentUser } from '@models/index';


@Injectable()
export class AuthGuard implements OnInit, CanActivate {

    testAuth: boolean;
    ssoAuthUrl: string;

    constructor(private router: Router,
                private authService: AuthenticationService,
                private currentUserService: CurrentUserService,
                private configService: ConfigService,
                private privilegeService: PrivilegeService) {}

    ngOnInit() {
        this.testAuth = this.configService.getConfiguration().testAuth;
        this.ssoAuthUrl = this.configService.getConfiguration().ssoAuthUrl;
      }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return new Promise((resolve) => {
            this.currentUserService.getCurrentUser().then(currentUser => {
                if (currentUser) {
                    let parentRoutePath = null;
                    if (route.parent && route.parent.routeConfig) {
                        parentRoutePath = route.parent.routeConfig.path;
                    }
                    resolve(this.canAccess(route.routeConfig.path, parentRoutePath, route.params['id'], currentUser));
                } else {
                    this.authService.navigateToLogin();
                    resolve(false);
                }
            }).catch(error => {
                console.error('Error getting current user in canActivate: ' + error);
                this.authService.navigateToLogin();
            });
        });
    }

    /**
     * Decides whether the user can access the requested resource based on
     * both the user privileges and authenticated/logged in state
     * @return {boolean}
     */
    canAccess(routePath: string, parentRoutePath: string, id: string, currentUser: CurrentUser): boolean {
      // let canAccess = false;

      if (this.isUserAuthenticated()) {
        // if user is authenticated proceed with checking authorization
        if (this.isUserAuthorized(routePath, id, currentUser)) {
          // authorization granted
          // canAccess = true;
            return true;
        } else {
          // authorization failed
          this.router.navigate(['/client/home']);
          // canAccess = false;
          // Only error if not autoforwarded from root
          // if (routePath != '') {
              // User is logged in but do not have rights to access the resource
              // alert('You do not have sufficient privileges to access ' + routePath);
          // }
          return false;
        }

        /*if (routePath.startsWith('client/')) {
            const disclaimerDisplayed = localStorage.getItem('displayDisclaimer');
            if (disclaimerDisplayed != 'true') {
                this.router.navigate(['disclaimer']);
                localStorage.setItem('displayDisclaimer', 'true');
            }
        }*/
      }
      // } else {
        // authentication failed
        // user session has expired or is not logged in
        alert('Your session has expired please login again.');
        // canAccess = false;
        this.authService.logout();
        return false;
      // }

      // return canAccess;
    }

    /**
     * Will going to check if user is already Authenticated
     * @return {boolean}
     */
    isUserAuthenticated(): boolean {
        // TODO:
        /*this.isAuthenticated = false;
        this.authToken = localStorage.getItem('Auth_token');
        if (this.authToken) {
            this.isAuthenticated = true;
        }
        return this.isAuthenticated;*/
        return true;
    }

    /**
     * Checks if the logged in user has privileges to access the requested resource
     * @return {boolean}
     */
    isUserAuthorized(routePath: string, id: string, currentUser: CurrentUser): boolean {
        const isAuthorized: number = this.privilegeService.doPrivilegesChecks(routePath, id, currentUser);
        switch (isAuthorized) {
            case 0: return false;
            case 1: return true;
            default: this.authService.logout(); return false;
        }
    }

}
