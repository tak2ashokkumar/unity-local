import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DELETE_ENTITY_GROUP_LIST, DELETE_PERMISSION_SET, GET_ENTITY_GROUP_LIST, GET_PERMISSION_SETS_LIST, TOGGLE_ENTITY_GROUP_STATUS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { EntityGroupDataType } from './usum-entity-group.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { Observable } from 'rxjs';

@Injectable()
export class UsumEntityGroupService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getEntityGroups(criteria: SearchCriteria): Observable<PaginatedResult<EntityGroupDataType>> {
    return this.tableService.getData<PaginatedResult<EntityGroupDataType>>(GET_ENTITY_GROUP_LIST(), criteria);
  }

  convertToViewData(data: EntityGroupDataType[]) {
    let viewData: EntityGroupViewData[] = [];
    data.forEach((d) => {
      let view: EntityGroupViewData = new EntityGroupViewData();
      view.uuid = d.uuid;
      view.name = d.name;
      view.description = d.description;      
      view.createdOn = d.created_at ? this.utilSvc.toUnityOneDateFormat(d.created_at) : 'NA';
      view.createdBy = d.created_by_name;
      view.entityObjects = d.group_objects?.length ? d.group_objects.map((p) => p.name) : [];
      view.entityObject = d.group_objects?.length ? d.group_objects.getFirst().name : 'All';
      view.entityObjectsBadgeCount = d.group_objects?.length ? d.group_objects.length - 1 : 0;
      view.entityObjectsList = view.entityObjects?.length ? view.entityObjects.slice(1) : [];
      view.isActive = d.is_active;
      if (d.is_active) {
        view.toggleIcon = 'fa-toggle-on';
        view.toggleTootipMsg = 'Disable';
      } else {
        view.toggleIcon = 'fa-toggle-off';
        view.toggleTootipMsg = 'Enable';
      }
      view.isDefault = d.is_default;
      d.is_default ? view.isDefaultClass = 'action-icons-disabled' : view.isDefaultClass = '';

      viewData.push(view);
    });
    return viewData;
  }

  toggleEntityGroup(EntityGroupData: EntityGroupViewData) {
    // let params: HttpParams = new HttpParams().set('uuid', EntityGroupData.uuid).set('status', !EntityGroupData.isActive);
    return this.http.get(TOGGLE_ENTITY_GROUP_STATUS(EntityGroupData.uuid));
  }

  deleteEntityGroup(entityGroupId: string) {
    return this.http.delete(DELETE_ENTITY_GROUP_LIST(entityGroupId));
  }

}

export class EntityGroupViewData {
  constructor() { }
  id: number;
  uuid: string;
  name: string;
  description: string;
  entityTypes: any[]
  entitySelection: string;
  createdOn: string;
  updatedOn: string;
  createdBy: string;
  isActive: boolean;
  isDefault: boolean;
  isDefaultClass: string;
  toggleIcon: string;
  toggleTootipMsg: string;
  entityObjects: string[];
  entityObject: string;
  entityObjectsBadgeCount: number;
  entityObjectsList: string[];
}
