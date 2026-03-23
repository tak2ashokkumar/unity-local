import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { ORCHESTRATION_INPUT_TEMPLATE, ORCHESTRATION_INPUT_TEMPLATE_CLONE, ORCHESTRATION_INPUT_TEMPLATE_DELETE, ORCHESTRATION_INPUT_TEMPLATE_STATUS_TOGGLE } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Injectable({
  providedIn: 'root'
})
export class OrchestrationInputTemplateService {

  constructor(
    private http: HttpClient,
    private tableService: TableApiServiceService,
    private userInfo: UserInfoService
  ) { }

  getTemplateData(criteria: SearchCriteria): Observable<PaginatedResult<InputTemplateModel>> {
    return this.tableService.getData<PaginatedResult<InputTemplateModel>>(ORCHESTRATION_INPUT_TEMPLATE (), criteria);
  }

  cloneData(uuid: string, name: string) {
    const req = {
      name: name
    };
    return this.http.post(ORCHESTRATION_INPUT_TEMPLATE_CLONE(uuid), req);
  }
  
  toggleStatus(uuid: string) {
    return this.http.get(ORCHESTRATION_INPUT_TEMPLATE_STATUS_TOGGLE(uuid));
  }
  
  deleteData(uuid: string) {
    return this.http.delete(ORCHESTRATION_INPUT_TEMPLATE_DELETE(uuid));
  }
}

export class InputTemplateModel {
  name: string; 
  category: string;
  description: string;
  input_type: string;
  input_name: string;
  type: string;
  options: string;
  uuid: string;
  template_status: string;
}
