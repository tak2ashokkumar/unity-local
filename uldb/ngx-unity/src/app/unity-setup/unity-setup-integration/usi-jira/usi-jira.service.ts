import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JiraInstance } from 'src/app/shared/SharedEntityTypes/jira.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UsiJiraService {
  constructor(private tableService: TableApiServiceService) { }

  getInstances(criteria: SearchCriteria): Observable<JiraInstance[]> {
    return this.tableService.getData<JiraInstance[]>(`customer/jira/instances/`, criteria);
  }
}

