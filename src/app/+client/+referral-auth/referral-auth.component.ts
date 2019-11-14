import {Component, OnInit} from '@angular/core';
import {UtilsService} from '@services/index';
import {Router} from '@angular/router';
/**
 * Component for ReferralAuth Management
 * @author Umair Yasin
 */
@Component({
  templateUrl: 'referral-auth.component.html',
  styleUrls: ['referral-auth.component.scss']
})
export class ReferralAuthComponent implements OnInit {
  permissionName = 'Referral / Authorization Status Inquiry';

  constructor(private route: Router,
              private utils: UtilsService) {
  }

  ngOnInit() {
    // Check if permission (transaction) exist for the user (in the permission list)
    // if not then redirect to home page
    const permissionList = JSON.parse(localStorage.getItem('permissionList'));
    if ((permissionList.filter(x => x.name === this.permissionName)) < 1) {
      this.route.navigate(['/client/home']);
    }

    // Get the permission List from local storage and fetch/set the specific permission Id for this page
    this.utils.setPermissionIdInLocalStorage(this.permissionName);
  }
}
