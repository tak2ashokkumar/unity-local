import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';


/*
* This pipe is used to filter objects from array
* input 1 : items(array items to be filtered)
* input 2 : callback(a function defined in respective controllers)
*/
@Pipe({
  name: 'callback',
  pure: false
})
export class CallbackPipe implements PipeTransform {
  transform(items: any[], callback: (item: any) => boolean): any {
    if (!items || !callback) {
      return items;
    }
    return items.filter(item => callback(item));
  }
}

@Pipe({
  name: 'SecToDays'
})
export class AppSecToDaysPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value) {
      const date = new Date(0, 0, 0, 0, 0, value);
      const days = Math.floor((value / 3600) / 24);
      const hours = date.getHours() + 'h ' + date.getMinutes() + 'm ' + date.getSeconds() + 's';
      return days > 0 ? days + 'days, ' + hours : hours;
    } else {
      return 'NA';
    }
  }

}

@Pipe({
  name: 'filesize'
})
export class FileSizePipe implements PipeTransform {
  private units: string[] = [
    'bytes',
    'KB',
    'MB',
    'GB',
    'TB',
    'PB'
  ];

  transform(value: any, args?: any): any {
    let result: string;
    if (isNaN(parseFloat(String(value))) || !isFinite(value)) {
      result = '?';
    } else {
      let unit = 0;

      while (value >= 1024) {
        value /= 1024;
        unit++;
      }

      result = `${unit ? value.toFixed(2) : value} ${this.units[unit]}`;
    }
    return result;
  }
}

@Pipe({
  name: 'bandwidth'
})
export class BandWidthPipe implements PipeTransform {
  private units: string[] = [
    'bps',
    'Kbps',
    'Mbps',
    'Gbps',
    'Tbps',
  ];

  transform(value: any, args?: any): any {
    let result: string;
    if (!value || isNaN(parseFloat(String(value))) || !isFinite(value)) {
      result = `${value} ${value == 0 ? this.units[0] : ''}`;
    } else {
      let unit = 0;

      while (value >= 1024) {
        value /= 1024;
        unit++;
      }

      result = value.toFixed(2) + ' ' + this.units[unit];
    }
    return result;
  }
}

@Pipe({
  name: "controlRequired"
})
export class ControlRequiredPipe implements PipeTransform {
  public transform(control: AbstractControl): boolean {
    console.log('control : ', control);
    console.log('control.validator : ', control.validator);

    //  Return when no control or a control without a validator is provided
    if (!control || !control.validator) {
      console.log('returning false ')
      return false;
    }

    //  Return the required state of the validator
    const validator = control.validator({} as AbstractControl);
    console.log('returning : ', validator && validator.required)
    return validator && validator.required;
  }
}

@Pipe({
  name: 'fileSizeConversion'
})
export class FileSizeConversionPipe implements PipeTransform {

  private readonly units: string[] = ['Bits', 'Bytes', 'KB', 'MB', 'GB', 'TB'];

  transform(input: string, toUnit?: string, decimalPlaces: number = 2): string {
    if (!input) return null;

    // Normalize input: remove extra spaces and extract value and unit
    input = input.trim();
    const regex = /^(\d+(\.\d+)?)\s*([a-zA-Z]+)$/;
    const match = input.match(regex);

    if (!match) {
      return input;
    }

    const value = parseFloat(match[1]);
    const fromUnit = match[3];

    // Validate fromUnit
    const fromIndex = this.units.indexOf(fromUnit);
    if (fromIndex === -1) throw new Error(`Invalid fromUnit: ${fromUnit}`);

    let sizeInBytes = value;
    if (fromIndex > 1) sizeInBytes = value * Math.pow(1024, fromIndex - 1); // Convert to Bytes

    let targetIndex = fromIndex;
    if (toUnit) {
      targetIndex = this.units.indexOf(toUnit);
      if (targetIndex === -1) throw new Error(`Invalid toUnit: ${toUnit}`);
    }

    // Convert the size to the target unit
    const finalSize = sizeInBytes / Math.pow(1024, targetIndex - 1);

    return `${finalSize.toFixed(decimalPlaces)} ${this.units[targetIndex]}`;
  }
}
