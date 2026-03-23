import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { PureStorageArrayHost, PureStorageGraphDataAttr, PureStorageSpaceAttr } from 'src/app/shared/SharedEntityTypes/storage-pure.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class PureStorageHostsService {

  constructor(private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getHosts(criteria: SearchCriteria): Observable<PaginatedResult<PureStorageArrayHost>> {
    return this.tableService.getData<PaginatedResult<PureStorageArrayHost>>(`customer/pure_storage/hosts/`, criteria);
  }

  convertToViewData(data: PureStorageArrayHost[]) {
    let viewData: PureStorageArrayHostViewData[] = [];
    data.map(d => {
      let a = new PureStorageArrayHostViewData();
      a.id = d.uuid;
      a.name = d.name;
      a.hostGroupName = d.host_group ? d.host_group : 'N/A';
      a.volumes = d.volumes && d.volumes.length ? d.volumes : [];
      a.noOfVolumes = a.volumes.length;
      a.createdAt = d.created_at ? this.utilSvc.toUnityOneDateFormat(d.created_at) : 'N/A';
      a.updatedAt = d.updated_at ? this.utilSvc.toUnityOneDateFormat(d.updated_at) : 'N/A';
      a.protectionGroups = d.protection_groups;
      a.space = d.space;
      a.graphData = d.graph_data;
      viewData.push(a);
    })
    return viewData;
  }
}

export class PureStorageArrayHostViewData {
  id: string;
  name: string;
  hostGroupName: string;
  noOfVolumes: number;
  createdAt: string;
  updatedAt: string;
  volumes: string[];
  protectionGroups: any[];
  space: PureStorageSpaceAttr;
  graphData: PureStorageGraphDataAttr;
}
