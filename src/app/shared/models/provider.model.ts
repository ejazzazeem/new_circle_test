export class PagedProviderPerson {
    providerPersonId: string;
    lastName: string;
    firstName: string;
    speciality: string;
    npi: string;
    address: string;
    taxId: string;
    city: string;
    state: string;
    zipCode: string;
    taxonomy: string;
    line1: string;
    line2: string;

    constructor(data: any) {
        this.lastName = data.lastName;
        this.firstName = data.firstName;
        this.speciality = data.speciality;
        this.npi = data.npi;
        this.providerPersonId = data.providerId;
        this.address = data.remitAddressLine1 + ' ' + data.remitAddressLine2;
        this.taxId = data.taxId;
        this.city = data.remitCity;
        this.state = data.remitState;
        this.zipCode = data.remitZip;
        this.taxonomy = data.taxonomy;
        this.line1 = data.remitAddressLine1;
        this.line2 = data.remitAddressLine2;


    }
}
