import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'searchFilter'
})
export class MultiSelectSearchFilter implements PipeTransform {
    transform(options: Array<any>, text: string, lableToDisplay: string): Array<any> {
        if (lableToDisplay) {
            const matchPredicate = (option: any) => option.isOptionGroupName || option[lableToDisplay].toLowerCase().indexOf((text).toLowerCase()) > -1;
            return options.filter((option: any) => {
                return matchPredicate(option);
            });
        } else {
            const matchPredicate = (option: any) => option.isOptionGroupName || option.toLowerCase().indexOf((text).toLowerCase()) > -1;
            return options.filter((option: any) => {
                return matchPredicate(option);
            });
        }
    }
}
