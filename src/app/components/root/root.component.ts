import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { AlertService, CurrentUserService } from '../../services/index';
import {AuthenticationService} from '../../services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  encapsulation: ViewEncapsulation.None
})
export class RootComponent implements OnInit {

  constructor(private router: Router,
              private currentUserService: CurrentUserService,
              private alertService: AlertService,
              private authenticationService: AuthenticationService) { }

  ngOnInit() {
      // remove current user, in case user did not fully log out and got here via SSO
       localStorage.removeItem('currentUser');
      localStorage.removeItem('ModeSwitch');
      this.currentUserService.clearCurrentUser();

      this.currentUserService.getCurrentUser().then(currentUser => {
          if (currentUser) {
              if (currentUser.isHealtheNetAdmin) {
                  this.router.navigate(['/admin/userManagement']);
              } else if (currentUser.isProviderOfficeUser || currentUser.isPayerUser) {
                  //localStorage.setItem('displayDisclaimer', 'true');
                  this.router.navigate(['/client/home']);
                  // localStorage.setItem('displayDisclaimer', 'false');
              } else {
                  this.alertService.error('Did not recognize user role ' + currentUser.role);
                  // If user is not recognized then navigate to login
                  this.authenticationService.navigateToLogin();
              }
          } else {
              // If no token found then navigate to appropriate login page
              this.authenticationService.navigateToLogin();
          }
      });

  }

}
