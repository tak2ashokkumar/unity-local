import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UsiAccount, UsiAccountViewData } from '../../unity-setup-integration.service';

@Injectable({
  providedIn: 'root'
})
export class UsiEventIngestionCustomListService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getAccounts(criteria: SearchCriteria): Observable<PaginatedResult<UsiAccount>> {
    return this.tableService.getData<PaginatedResult<UsiAccount>>(`customer/monitoring-tool/custom/accounts/`, criteria);
  }

  convertToViewData(data: UsiAccount[]): UsiAccountViewData[] {
    let viewData: UsiAccountViewData[] = [];
    data.forEach(v => {
      let view: UsiAccountViewData = new UsiAccountViewData();
      view.uuid = v.uuid;
      view.name = v.name;
      view.url = v?.event_inbound_webhook?.webhook_url ? v?.event_inbound_webhook?.webhook_url : '';
      view.token = v?.event_inbound_webhook?.token ? v?.event_inbound_webhook?.token : '';
      view.ingestEvent = v.ingest_event;
      view.ingestEventIcon = v.ingest_event ? 'fa-check-circle text-success' : 'fa-check-circle text-muted';
      viewData.push(view);
    });
    return viewData;
  }

  deleteAccount(instanceId: string) {
    return this.http.delete(`customer/monitoring-tool/custom/accounts/${instanceId}`);
  }

  getPayloadResponse(data: any, instanceId: string) {
    return this.http.post(`customer/monitoring-tool/custom/accounts/${instanceId}/event_inbound_webhook/test_payload/`, data
      , { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    )
  }

}
