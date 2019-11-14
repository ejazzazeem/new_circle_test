import { Component, OnInit } from '@angular/core';
import {UtilsService} from '@services/index';
import {Router} from '@angular/router';

/**
 * Component for Consent Management
 * @author mmubasher
 */
@Component({
  templateUrl: 'patient-consent.component.html',
  styleUrls: ['patient-consent.component.scss']
})
export class PatientConsentComponent implements OnInit {
  permissionName = 'Patient Consent';

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
