import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

@Pipe({
  name: 'clientSideSearch'
})
export class ClientSideSearchPipe implements PipeTransform {

  transform(value: any, input: string, searchableList: any) {
    if (input) {
      input = input.toLowerCase();
      return value.filter(function (el: any) {
        var isTrue = false;
        for (var k in searchableList) {
          if (el[searchableList[k]] && el[searchableList[k]].toLowerCase().indexOf(input) > -1) {
            isTrue = true;
          }
          if (isTrue) {
            return el
          }
        }

      })
    }
    return value;
  }
}
