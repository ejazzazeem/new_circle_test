import { Pipe, PipeTransform } from '@angular/core';

/**
 * Coverage Pipe - returns coverage level value.
 */
@Pipe({name: 'coveragePipe'})
export class CoverageLevel implements PipeTransform {
    public transform(coverageValue: string): string {
        if (coverageValue !== '') {
            switch (coverageValue) {
                case 'IND':
                    return 'Individual';
                case 'CHD':
                   return 'Children Only';
                case 'ECH':
                    return 'Employee and Children';
                case 'DEP':
                    return 'Dependents Only';
                case 'FAM':
                    return 'Family';
                case 'EMP':
                    return 'Employee Only';
                case 'ESP':
                    return 'Employee and Spouse';
                case 'SPC':
                    return 'Spouse and Children';
                case 'SPO':
                    return 'Spouse Only';
                default:
                    return 'Invalid Coverage Level';
            }
        }
    }
}
