import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

/**
 * Convert date to string
 */
@Pipe({name: 'convertStringToDateMulti'})
export class ConvertStringToDateMulti implements PipeTransform {
    public transform(dateOfBirth: string): string {
        if (dateOfBirth) {
            return moment(dateOfBirth, 'YYYY MM DD').format('L'); // MM/DD/YYYY
        } else {
            return '. . . . . . .';
        }
    }
}
