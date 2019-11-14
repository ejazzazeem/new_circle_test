export interface SubscriberModel {
    memberNo: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    ssn?: string;
    gender?: string;
}

export interface DependentModel {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender?: string;
}

export interface ServiceTypeModel {
    eligibilityDate: string;
    serviceTypeCode: [ string ];
}

export interface PayerModel {
    payerId: string;
    name: string;
}

export interface RequestingProvider {
    id: string;
    firstName: string;
    lastName: string;
    taxId: string;
    npi: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    taxonomy: string;
}

export interface OnOffConfigs {
    configName: string;
    value: string;
}

export interface PostEligibilityModel {
    payer: PayerModel;
    payerProvider?: RequestingProvider;
    subscriber: SubscriberModel;
    dependent: DependentModel;
    service: ServiceTypeModel;
}
