/**
 * Created by Mehwish on 6/30/2018.
 */
import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
@Pipe({
    name: 'filterDates',
    pure: false
})
/**
 * returns unique date
 */
export class FilterDate implements PipeTransform {
    transform(value: any): any {
        if (value !== undefined && value !== null ) {
            return _.uniqBy(value, 'date');
        }
        return value;
    }
}
