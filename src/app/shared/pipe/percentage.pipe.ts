// percentage.pipe.ts
import {Pipe, PipeTransform} from '@angular/core';

/**
 *
 */
@Pipe({name: 'percentage'})
export class PercentagePipe implements PipeTransform {
    /**
     *
     * @param value
     * @returns {string}
     */
    transform(value: any): any {
        if ( value === '') {
            return '';
        } else {
            const percentageValue = value * 100;
            return percentageValue + '%';
        }
    }
}
