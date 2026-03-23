import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable()
export class SubscribedCatalogueServicesService {

  constructor(private http: HttpClient) { }

  getSubscribedCatalogueServices(): Observable<any[]> {
    // return this.http.get<any[]>('');
    return of([]);
  }

  convertToViewData(services: any[]): any[] {
    return [];
  }
}
