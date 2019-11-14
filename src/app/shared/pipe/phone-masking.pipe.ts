import {Pipe, PipeTransform} from '@angular/core';
declare function isNumeric(e): any;

/**
 *
 */
@Pipe({name: 'phoneMask'})
export class PhoneMaskPipe implements PipeTransform {
    /**
     *
     * @param phoneNumber
     * @returns {string}
     */
    transform(phoneNumber: string): any {
        if (phoneNumber.length === 10 && isNumeric(phoneNumber)) {
            return '(' + phoneNumber.slice(0, 3) + ') ' + phoneNumber.slice(3, 6) + '-' + phoneNumber.slice(6);
        } else if (phoneNumber) {
            return phoneNumber;
        } else {
            return '';
        }
    }
}
