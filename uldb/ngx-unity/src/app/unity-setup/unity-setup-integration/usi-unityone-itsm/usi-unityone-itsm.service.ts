import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UsiUnityoneItsmService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getUnityOneITSMData(criteria: SearchCriteria): Observable<PaginatedResult<UnityOneITSMType>> {
    return this.tableService.getData<PaginatedResult<UnityOneITSMType>>(`/rest/unity_itsm/tables/`, criteria);
  }

  deleteUnityOneITSM(uuid: string) {
    return this.http.delete(`/rest/unity_itsm/tables/${uuid}/`);
  }

  toggleStatus(uuid: string) {
    return this.http.get(`/rest/unity_itsm/tables/${uuid}/toggle/`);
  }

  convertToViewData(data: UnityOneITSMType[]): UnityOneITSMView[] {
    let viewData: UnityOneITSMView[] = [];
    data.map(val => {
      let im: UnityOneITSMView = new UnityOneITSMView();
      im.uuid = val.uuid;
      im.name = val.name;
      im.description = val.description;
      im.idTemplate = val.id_template;
      im.status = val.is_enabled;
      viewData.push(im);
    });
    return viewData;
  }

}

export class UnityOneITSMType {
  uuid: string;
  name: string;
  description: string;
  id_template: string;
  is_enabled: boolean;
  fields: any[];
}

export class UnityOneITSMView {
  uuid: string;
  name: string;
  description: string;
  idTemplate: string;
  status: boolean;
  fields: any[];
}

