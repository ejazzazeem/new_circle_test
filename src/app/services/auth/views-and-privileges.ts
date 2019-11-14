/**
 * Roles is a simple class with static constants.
 * With this its easy to know that what roles system supports.
 * Note: Feel free to add the new roles
 */
export enum Roles {
    HEALTHENET_ADMIN = 'HEALTHENET_ADMIN',
    PROVIDER_OFFICE_USER = 'PROVIDER_OFFICE_USER',
    PAYER_USER = 'PAYER_USER',
    ALL = 'ALL'
}

export class Role {
    role: string;
    limitToGroupAdmin = false;
    limitByGroups = false;

    constructor(role: string, limitToGroupAdmin: boolean = false, limitByGroups: boolean = false) {
        this.role = role;
        this.limitToGroupAdmin = limitToGroupAdmin;
        this.limitByGroups = limitByGroups;
    }
}

/**
 * This enum is to map the views with granted privileges
 * So each view to be defined as for e.g. appointments = <any> [Array of privileges]
 * Please follow the code snippet below
 */
export class ViewRoles {

    static ALL: Role[] = [
                          new Role(Roles.ALL)
                      ];

    /* Users */
    static VIEW_USERS: Role[] = [
                                 new Role(Roles.HEALTHENET_ADMIN),
                                 new Role(Roles.PROVIDER_OFFICE_USER, true),
                                 new Role(Roles.PAYER_USER, true)
                             ];
    static ADD_EDIT_USER: Role[] = [
                                 new Role(Roles.HEALTHENET_ADMIN),
                                 new Role(Roles.PROVIDER_OFFICE_USER, true),
                                 new Role(Roles.PAYER_USER, true)
                             ];

    /* Payers */
    static VIEW_PAYERS: Role[] = [
                                  new Role(Roles.HEALTHENET_ADMIN),
                                  new Role(Roles.PAYER_USER, true)
                              ];
    static VIEW_PAYER: Role[] = [
                                  new Role(Roles.HEALTHENET_ADMIN),
                                  new Role(Roles.PAYER_USER, true, true)
                              ];
    static ADD_PAYER: Role[] = [
                                  new Role(Roles.HEALTHENET_ADMIN)
                              ];
    static EDIT_PAYER: Role[] = [
                                  new Role(Roles.HEALTHENET_ADMIN),
                                  new Role(Roles.PAYER_USER, true, true)
                              ];

    /* Groups */
    static VIEW_PROVIDER_GROUPS: Role[] = [
                                  new Role(Roles.HEALTHENET_ADMIN),
                                  new Role(Roles.PROVIDER_OFFICE_USER, true)
                              ];
    static VIEW_PROVIDER_GROUP: Role[] = [
                                  new Role(Roles.HEALTHENET_ADMIN),
                                  new Role(Roles.PROVIDER_OFFICE_USER, true, true)
                              ];
    static ADD_PROVIDER_GROUP: Role[] = [
                                  new Role(Roles.HEALTHENET_ADMIN)
                              ];
    static EDIT_PROVIDER_GROUP: Role[] = [
                                  new Role(Roles.HEALTHENET_ADMIN),
                                  new Role(Roles.PROVIDER_OFFICE_USER, true, true)
                              ];
}
