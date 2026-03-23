import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { regions } from './region.const';

@Injectable({
  providedIn: 'root'
})
export class PublicCloudService {

  constructor() { }

  getRegions(): Observable<Region[]> {
    return of(regions);
  }
}
