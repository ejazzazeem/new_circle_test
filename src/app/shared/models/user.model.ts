import { GroupUser } from './group.model';

export class User {
    id: number;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
}

export class CurrentUser {
    id: number;
    loginId: string;
    role: string;
    groups: GroupUser[];
    isProviderOfficeUser: boolean;
    isPayerUser: boolean;
    isHealtheNetAdmin: boolean;
    isGroupAdmin: boolean;
}

export interface TestCredentials {
    username: string;
}

// TODO: Update any to a proper type
export interface UserDataTableModel {
    userID: string;
    firstName: string;
    lastName: string;
    userGroups: any;
    userPayers: any;
}

// ADD USER MODEL ---------------------------------------------------------------
export interface RegionModel {
    regionId: string;
    name: string;
}

export interface PermissionModel {
    permissionId: string;
    name: string;
}

export interface UserGroupModel {
    groupId: string;
    name: string;
    groupType: string;
}

export interface PermissionOverridesModel {
    group: UserGroupModel;
    permission: PermissionModel;
    exclude: boolean;
}

export interface RegionOverridesModel {
    group: UserGroupModel;
    region: RegionModel;
    exclude: boolean;
}

export interface RoleModel {
    role: string;
}

export interface AddUserModel {
    userId?: string;
    enabled: boolean;
    role: RoleModel;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email: string;
    pinCode: string;
    externalId: string;
    loginId: string;
    password?: string;
    userGroups: UserGroupModel[];
    permissionOverrides: PermissionOverridesModel [];
    regionOverrides: RegionOverridesModel [];
}
