export interface Region {
    regionId: string;
    name: string;
    checked?: boolean;
}

export interface Permission {
    permissionId?: string;
    name: string;
    custom?: boolean;
    adxTransaction?: boolean;
    checked?: boolean;

}

export interface OnOFFConfig {
    configName: string;
    value: string;

}

export interface AddPermission {
    permissionId?: string;
    name: string;
    custom: boolean;
    enabled:  boolean;
    onOffConfigs?: OnOFFConfig[];
    displayXslt?: string;

}
