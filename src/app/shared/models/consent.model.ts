export interface ConsentRequest {
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
}

export interface Consent {
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    value: string;
    formUrl: string;
}
