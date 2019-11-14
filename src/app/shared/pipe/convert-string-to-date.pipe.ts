import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

/**
 * Title case string - convert first letter of every word to capital case
 */
@Pipe({name: 'convertStringToDate'})
export class ConvertStringToDate implements PipeTransform {
    public transform(dateOfBirth: any): any {
        if (dateOfBirth) {
            return moment(dateOfBirth).format('L'); // MM/DD/YYYY
        } else {
            return '';
        }
    }
}
