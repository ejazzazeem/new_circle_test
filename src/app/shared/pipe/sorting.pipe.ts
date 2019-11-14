/**
 * Created by Mehwish on 3/17/2018.
 */
import { Pipe, PipeTransform } from '@angular/core';

/**
 * AlphaNumeric Sorting - sort array of strings
 */
@Pipe({name: 'sortBy'})
export class ArraySortPipe implements PipeTransform {
    transform(array: Array<string>, args: string): Array<string> {
        array.sort((a: any, b: any) => {
            if ( a[args].toLowerCase() < b[args].toLowerCase() ) {
                return -1;
            } else if ( a[args].toLowerCase() > b[args].toLowerCase() ) {
                return 1;
            } else {
                return 0;
            }
        });
        return array;
    }
}
