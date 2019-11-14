import { Region, Permission } from './index';

export class Group {
    id: number;
    groupName: string;
    status: boolean;
}

export class AdminUser {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface GroupInfo {
     groupId: string;
     name: string;
     groupType: string;
}

export interface  GroupUser {
    groupDetail: GroupInfo;
    user: AdminUser;
    admin: boolean;
}

export interface GroupUserTableModel {
    data: GroupUser[];
}

export interface State {
    value: string;
    description: string;
}

export interface GroupAddress {
    line1: string;
    line2: string;
    city: string;
    state: string;
    zipCode: string;
    county: string;
    region: string;
}

export interface GroupAddModel {
    providerGroupId: string;
    name: string;
    status: string;
    description: string;
    address: GroupAddress;
    defaultRegions: Region[];
    defaultPermissions: Permission[];
}
