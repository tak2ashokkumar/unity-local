import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { PureStorageArrayHostGroup, PureStorageGraphDataAttr, PureStorageSpaceAttr } from 'src/app/shared/SharedEntityTypes/storage-pure.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class PureStorageHostGroupsService {

  constructor(private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,) { }

  getHostGroups(criteria: SearchCriteria): Observable<PaginatedResult<PureStorageArrayHostGroup>> {
    return this.tableService.getData<PaginatedResult<PureStorageArrayHostGroup>>(`customer/pure_storage/host_groups/`, criteria);
  }

  convertToViewData(data: PureStorageArrayHostGroup[]) {
    let viewData: PureStorageArrayHostGroupViewData[] = [];
    data.map(d => {
      let a = new PureStorageArrayHostGroupViewData();
      a.id = d.uuid;
      a.name = d.name;
      a.hosts = d.hosts && d.hosts.length ? d.hosts : [];
      a.createdAt = d.created_at ? this.utilSvc.toUnityOneDateFormat(d.created_at) : 'N/A';
      a.updatedAt = d.updated_at ? this.utilSvc.toUnityOneDateFormat(d.updated_at) : 'N/A';
      a.space = d.space;
      a.graphData = d.graph_data;
      viewData.push(a);
    })
    return viewData;
  }
}

export class PureStorageArrayHostGroupViewData {
  id: string;
  name: string;
  hosts: string[];
  createdAt: string;
  updatedAt: string;
  space: PureStorageSpaceAttr;
  graphData: PureStorageGraphDataAttr;
}
