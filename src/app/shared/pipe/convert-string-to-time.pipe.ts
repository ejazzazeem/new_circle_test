/**
 * Created by Mehwish on 3/28/2018.
 */
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Convert string to time
 */
@Pipe({name: 'time'})
export class ConvertStringToTime implements PipeTransform {
    public transform(time: any): any {
        if (time !== '' ) {
            let hours = time.substr(0, 2);
            const minutes = time.substr(2, 2);

            if (hours >= '12') {
                if (hours === '12') {
                    time = hours + ':' + minutes + ' PM';
                } else {
                    hours = hours - 12;
                    if (hours < 10) {
                        time = '0' + hours + ':' + minutes + ' PM';
                    } else if (hours === 10 || hours === 11) {
                        time = hours + ':' + minutes + ' PM';
                    } else {
                        time = 'invalid time';
                    }
                }
            } else {
                if (hours === '00') {
                    time =  12 + ':' + minutes + ' AM';
                } else {
                    time = hours + ':' + minutes + ' AM';
                }
            }
            return time; // HH:MM
        }
    }
}
