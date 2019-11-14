export interface PayerInfo {
    payerId: string;
    name: string;
    status: string;
    admin?: string[];
}

export interface PayerResult {
    totalCount: number;
    returnCount: number;
    pageOffset: number;
    results?: PayerInfo[];
}

export interface PayerSource {
   payerId: string;
   name: string;
}

export interface ProviderPerson {
    providerPersonId: string;
    firstName: string;
    lastName: string;
    speciality: string;
    npi: string;
    payerSource?: PayerSource;
    status: string;
    taxId: string;
}

export interface ListUploadDetails {
    uploadStatus: string;
    folderPath: string;
    uploadTime: string;
}


export interface PayerProvider {
    providerPerson: ProviderPerson;
    uploadDetails:  ListUploadDetails;

}

export interface Payer {
    payerId?: string;
    status: string;
    name: string;
    description?: string;
    regions: Regions;
    connectivity: Connectivity;
}

export interface Regions {
    regionId?: string;
    name?: string;
}

export interface Connectivity {
    transportType: string;
    auth: Auth;
    endPoint: string;
}

export interface Auth {
    method: string;
    certificateName: string;
    certificate: string;
    username: string;
    password: string;
}

export interface AuthenticationType {
    id?: string;
    name?: string;
}

export interface TransportType {
    id?: string;
    name?: string;
}

