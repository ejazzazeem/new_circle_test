export class PayerApiBuilder {
    static buildStatus(status: any) {
        if (status === true || status === 'checked') {
            return 'ACTIVE';
        } else {
            return 'INACTIVE';
        }
    }

    static buildDescription(formData: any) {
        if (formData.description === undefined) {
            delete formData.description;
            return formData;
        } else {
            return formData;
        }
    }
}
