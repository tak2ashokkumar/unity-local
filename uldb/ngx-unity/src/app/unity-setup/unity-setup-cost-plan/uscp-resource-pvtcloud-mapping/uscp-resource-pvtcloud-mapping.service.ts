import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UscpResourceModelDataType } from '../uscp-resource-model/uscp-resource-model.type';
import { AssignedCloudsListType } from './uscp-resource-pvtcloud-mapping.type';
import moment from 'moment';

@Injectable()
export class UscpResourcePvtcloudMappingService {

  constructor(private tableService: TableApiServiceService,
    private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  getResourceDetails(uuid: string): Observable<UscpResourceModelDataType> {
    return this.http.get<UscpResourceModelDataType>(`customer/resources/resource_plan/${uuid}/`);
  }

  getAssignedClouds(criteria: SearchCriteria): Observable<PaginatedResult<AssignedCloudsListType>> {
    return this.tableService.getData<PaginatedResult<AssignedCloudsListType>>('customer/resources/private_cloud_resources/', criteria);
  }

  delete(uuid: string) {
    return this.http.delete(`customer/resources/private_cloud_resources/${uuid}/`);
  }

  updateStatus(uuid: string, status: string) {
    return this.http.patch(`customer/resources/private_cloud_resources/${uuid}/`, { is_active: status });
  }

  convertToViewData(data: AssignedCloudsListType[]): AssignedCloudsViewData[] {
    let viewData: AssignedCloudsViewData[] = [];
    data.map(a => {
      let ud: AssignedCloudsViewData = new AssignedCloudsViewData();
      ud.uuid = a.uuid;
      ud.cloudName = a.private_cloud.name;
      ud.assignedOn = a.assigned_at ? moment(a.assigned_at).format('DD-MM-YYYY') : null;
      ud.removedOn = a.removed_at ? moment(a.removed_at).format('DD-MM-YYYY') : null;
      ud.createdOn = a.created_date ? moment(a.created_date).format('DD-MMM-YYYY h:mm A') : null;
      ud.createdBy = a.created_user;
      ud.modifiedBy = a.modified_user;
      ud.isActive = a.is_active;
      viewData.push(ud);
    });
    return viewData;
  }

}

export class AssignedCloudsViewData {
  constructor() { }
  uuid: string;
  cloudName: string;
  assignedOn: string;
  removedOn: string;
  createdOn: string;
  createdBy: string;
  modifiedBy: string;
  isActive: boolean;
}
