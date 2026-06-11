import { Pipe, PipeTransform, Injectable } from '@angular/core';
import { SearchCriteria } from './search-criteria';

@Injectable({
  providedIn: 'root'
})
export class ClientSidePage {

  page<T>(arr: Array<T>, criteria: SearchCriteria): Array<T> {
    const start = (criteria.pageNo - 1) * criteria.pageSize;
    const end = criteria.pageNo * criteria.pageSize;
    return arr.slice(start, end);
  }
}
