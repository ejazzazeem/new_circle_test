import {Component, OnInit} from '@angular/core';
import {UtilsService} from '@services/index';
import {Router} from '@angular/router';
import {USER_ROLES } from '@misc/index';
import {CurrentUserService} from '../services/auth/current-user.service';

/**
 * Component for Batch Handling
 * @author mmubasher
 */
@Component({
  templateUrl: 'batch-handler.component.html',
  styleUrls: ['batch-handler.component.scss']
})
export class BatchHandlerComponent implements OnInit {
  currentUser: any;
  permissionName = 'Batch';
  userRole = USER_ROLES;
  constructor(private currentUserService: CurrentUserService,
              private utils: UtilsService,
              private route: Router) {
  }

  ngOnInit() {
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
      if (this.currentUser.role !== this.userRole.ADMIN1_ROLE || this.currentUser.role !== this.userRole.ADMIN2_ROLE) {
        if ((permissionList.filter(x => x.name === this.permissionName)) < 1) {
          this.route.navigate(['/client/home']);
        }
      }
    }

    // Get the permission List from local storage and fetch/set the specific permission Id for this page
    this.utils.setPermissionIdInLocalStorage(this.permissionName);
  }
}
