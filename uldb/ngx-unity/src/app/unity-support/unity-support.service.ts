import { Injectable } from '@angular/core';
import { HttpParams, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TicketMgmtList } from '../shared/SharedEntityTypes/ticket-mgmt-list.type';
import { GET_TICKET_MGMT_LIST } from '../shared/api-endpoint.const';
import { map } from 'rxjs/operators';
import { SupportTabs } from './unity-support-resolver.service';

@Injectable()
export class UnitySupportService {

  constructor(private http: HttpClient) { }
  getTabs(): Observable<SupportTabs[]> {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<TicketMgmtList[]>(GET_TICKET_MGMT_LIST(), { params }).pipe(
      map((data: TicketMgmtList[]) => {
        return data.map(d => {
          const tab: SupportTabs = { ...d };
          if (d.type === 'UnityOne ITSM') {
            const itsmUuid = 'a9f2d1b7-3e4c-4f8a-9c2b-6e5d1a7c0b42';
            tab.url = `/support/ticketmgmt/${itsmUuid}`;
            tab.uuid = itsmUuid;
          } else {
            tab.url = `/support/ticketmgmt/${d.uuid}`;
          }
          return tab;
        });
      })
    );
  }
}
