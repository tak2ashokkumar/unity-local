import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { UnityAssistantChatHistory } from '../uc-history.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { FormBuilder } from '@angular/forms';

@Injectable()
export class UchChatService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder) { }

  getChats(criteria: SearchCriteria): Observable<PaginatedResult<UnityAssistantChatHistory>> {
    return this.tableService.getData<PaginatedResult<UnityAssistantChatHistory>>(`customer/network_agent/conversations/list_by_org_get/`, criteria);
  }

  getResponse(data: any) {
    return this.http.post(`mcp/query/`, data);
  }

  buildForm() {
    return this.builder.group({
      'chat': ['']
    });
  }
}
