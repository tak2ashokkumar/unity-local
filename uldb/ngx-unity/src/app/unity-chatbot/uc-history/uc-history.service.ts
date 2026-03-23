import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { UnityAssistantHistory } from './uc-history.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UcHistoryService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getHistory(criteria: SearchCriteria): Observable<PaginatedResult<UnityAssistantHistory>> {
    return this.tableService.getData<PaginatedResult<UnityAssistantHistory>>(`customer/network_agent/conversations/list_by_org_get/`, criteria);
  }
}
