import { Pipe, PipeTransform } from '@angular/core';


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
