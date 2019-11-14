import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Role, Roles, ViewRoles } from './views-and-privileges';
import { CurrentUser } from '@models/index';

@Injectable()
export class PrivilegeService {

    /**
     * Perform privileges check of the logged in user
     * @param viewPath on which to perform the privilege check
     * @returns boolean
     */
    doPrivilegesChecks(viewPath: string, id: string, currentUser: CurrentUser): number {
            if (!currentUser) {
                console.warn('No current user.');
                return 0;
            }

            let userRole: String;
            if (currentUser.isHealtheNetAdmin) {
                userRole = Roles.HEALTHENET_ADMIN;
            } else if (currentUser.isProviderOfficeUser) {
                userRole = Roles.PROVIDER_OFFICE_USER;
            } else if (currentUser.isPayerUser) {
                userRole = Roles.PAYER_USER;
            }

            const groupIds: String[] = [];
            const adminGroupIds: String[] = [];
            if (currentUser.groups) {
                for (const group of currentUser.groups) {
                    const groupId = group.groupDetail.groupId;
                    groupIds.push(groupId);
                    if (group.admin) {
                        adminGroupIds.push(groupId);
                    }
                }
            }

            if (!userRole) {
                return -1;
            }

            const roles = this.map(viewPath);

            // let roleNames = [];
            for (const role of roles) {
                // roleNames.push(role.role);
                if (role.role === Roles.ALL) {
                    return 1;
                }

                if (role.role === userRole) {
                    if (role.limitByGroups) {
                        if (!_.includes(groupIds, id)) {
                            console.warn('User not allowed to access group ID: ' + id);
                            return 0;
                        }
                        // Limited by group and group admin
                        if (role.limitToGroupAdmin) {
                            if (!_.includes(adminGroupIds, id)) {
                                console.warn('User not allowed admin access to group ID: ' + id);
                                return 0;
                            }

                        }
                    }

                    // Not limited by group
                    if (role.limitToGroupAdmin) {
                        if (adminGroupIds.length === 0) {
                            console.warn('User not allowed admin access');
                            return 0;
                        }
                    }

                    // User has access to this view
                    return 1;
                }

            }
    }

    /**
     * Map the appropriate privileges associated with the each view
     * @param viewPath on which to perform the privilege check
     * @returns Privileges
     */
    map(viewPath: string): Role[] {
        switch (viewPath) {
            case 'userManagement/':
            case 'userManagement/read/:id':
                return ViewRoles.VIEW_USERS;

            case 'userManagement/add':
            case 'userManagement/update/:id':
                return ViewRoles.ADD_EDIT_USER;

            case 'admin/payers':
                return ViewRoles.VIEW_PAYERS;
            case 'admin/payer-details/:id':
                return ViewRoles.VIEW_PAYER;
            case 'admin/add-payer':
                return ViewRoles.ADD_PAYER;
            case 'admin/add-payer/:id':
                return ViewRoles.EDIT_PAYER;

            case 'admin/groups':
                return ViewRoles.VIEW_PROVIDER_GROUPS;
            case 'admin/read-group-detail/:id':
                return ViewRoles.VIEW_PROVIDER_GROUP;
            case 'admin/add-group':
                return ViewRoles.ADD_PROVIDER_GROUP;
            case 'admin/edit-group/:id':
                return ViewRoles.EDIT_PROVIDER_GROUP;

            default:
                return ViewRoles.ALL;
        }
    }

}


