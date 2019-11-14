import { Pipe, PipeTransform } from '@angular/core';

/**
 * Title case string - convert first letter of every word to capital case
 */
@Pipe({name: 'titleCase'})
export class TitleCasePipe implements PipeTransform {
    public transform(input: string): string {
        if (!input) {
            return '';
        } else {
            return input.replace(/\w\S*/g, (txt => txt[0].toUpperCase() + txt.substr(1).toLowerCase() ));
        }
    }

}
