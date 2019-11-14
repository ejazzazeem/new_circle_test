import {Component, OnInit} from '@angular/core';
import {CurrentUserService, UtilsService} from '@services/index';
import {Router} from '@angular/router';
import { USER_ROLES } from '@misc/index';
/**
 * Component for Reporting
 * @author Zofishan Khalid
 */
@Component({
  templateUrl: 'reporting.component.html',
  styleUrls: ['reporting.component.scss']
})
export class ReportingComponent implements OnInit {
  currentUser: any;
  permissionName = 'Reporting';
  userRole = USER_ROLES;
  constructor(private currentUserService: CurrentUserService,
              private utils: UtilsService,
              private route: Router) {
  }

  ngOnInit() {
    this.clearReportsStorage();
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      this.currentUser = JSON.parse(currentUser);
    } else {
      this.currentUserService.getCurrentUser().then(user => {
        if (user) {
          this.currentUser = user;
        } else {
          console.error('Error getting current user while initializing side menu for reporting');
        }
      }).catch(error => {
        console.error('Error getting current user while initializing side menu for reporting: ' + error);
      });
    }
    // Check if permission (transaction) exist for the user (in the permission list)
    // if not then redirect to home page

    const permissionList = JSON.parse(localStorage.getItem('permissionList'));
    if (!this.userRole.ADMIN1_ROLE || !this.userRole.ADMIN2_ROLE) {
      if ((permissionList.filter(x => x.name === this.permissionName)) < 1) {
        this.route.navigate(['/client/home']);
      }
    }

    // Get the permission List from local storage and fetch/set the specific permission Id for this page
    this.utils.setPermissionIdInLocalStorage(this.permissionName);
  }

  clearReportsStorage() {
    localStorage.removeItem('MyReport'); localStorage.removeItem('currentReport'); localStorage.removeItem('currentTab');
  }
}
