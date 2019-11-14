import {Component, OnInit} from '@angular/core';
import {UtilsService} from '@services/index';
import {Router} from '@angular/router';

/**
 * Component for Eligibility Management
 * @author Umair Yasin
 */
@Component({
  templateUrl: 'eligibility.component.html',
  styleUrls: ['eligibility.component.scss']
})
export class EligibilityComponent implements OnInit {
  permissionName = 'Eligibility Inquiry';

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
