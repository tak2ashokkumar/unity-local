import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { OntapMonitoringItem, OntapMonitoringItemGraph } from '../storage-ontap.type';

@Injectable()
export class StorageOntapDetailsService {

  constructor(private http: HttpClient,) { }

  getItems(clusterId: string, entity: string): Observable<OntapMonitoringItem[]> {
    let params: HttpParams = new HttpParams().set('item_name', entity);
    return this.http.get<OntapMonitoringItem[]>(`customer/storagedevices/${clusterId}/monitoring/numeric_items/`, { params: params });
  }

  convertToViewData(items: OntapMonitoringItem[]): StorageOntapEntityDetails[] {
    let viewData: StorageOntapEntityDetails[] = [];
    items.map(i => {
      let a = new StorageOntapEntityDetails();
      a.itemId = i.item_id;
      a.name = i.name;
      a.key = i.key;
      a.valueType = i.value_type;
      a.loader = `${i.item_id} - ${i.name}`;
      viewData.push(a);
    })
    return viewData;
  }

  getGraph(clusterId: string, itemId: number): Observable<Map<string, OntapMonitoringItemGraph>> {
    let url = `customer/storagedevices/${clusterId}/monitoring/item_graph_image/${itemId}/`;

    return this.http.get<OntapMonitoringItemGraph>(url)
    .pipe(
      map((res: any) => {
        return new Map<string, OntapMonitoringItemGraph>().set(itemId.toString(), res);
      }),
      catchError((error: HttpErrorResponse) => {
        return of(new Map<string, OntapMonitoringItemGraph>().set(itemId.toString(), null));
      })
    );
  }
}

export class StorageOntapEntityDetails {
  itemId: number;
  name: string;
  key: string;
  valueType: string;
  graph?: string;
  loader: string;
}
