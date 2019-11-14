import {Pipe, PipeTransform} from '@angular/core';

/**
 *
 */
@Pipe({name: 'zipCodeMask'})
export class ZipCodeMaskPipe implements PipeTransform {
    /**
     *
     * @param zipCode
     * @returns {string}
     */
    transform(zipCode: any): any {
        if (zipCode) {
            if (zipCode.length > 6) {
                return zipCode.slice(0, 5) + '-' + zipCode.slice(5); // 9 characters masking
            } else if (zipCode.length === 6) {
                return zipCode.slice(0, 3) + ' ' + zipCode.slice(3); // 6 characters masking
            } else {
                return zipCode; // 5 characters masking
            }
        } else {
            return '';
        }
    }
}
