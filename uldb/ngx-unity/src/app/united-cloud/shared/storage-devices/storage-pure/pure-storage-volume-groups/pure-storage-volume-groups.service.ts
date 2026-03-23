import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { PureStorageArrayVolumeGroup, PureStorageGraphDataAttr, PureStorageSpaceAttr } from 'src/app/shared/SharedEntityTypes/storage-pure.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class PureStorageVolumeGroupsService {

  constructor(private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,) { }

  getVolumeGroups(criteria: SearchCriteria): Observable<PaginatedResult<PureStorageArrayVolumeGroup>> {
    return this.tableService.getData<PaginatedResult<PureStorageArrayVolumeGroup>>(`customer/pure_storage/volume_groups/`, criteria);
  }

  convertToViewData(data: PureStorageArrayVolumeGroup[]) {
    let viewData: PureStorageArrayVolumeGroupViewData[] = [];
    data.map(d => {
      let a = new PureStorageArrayVolumeGroupViewData();
      a.id = d.uuid;
      a.name = d.name;
      a.volumes = d.volumes;
      a.createdAt = d.created_at ? this.utilSvc.toUnityOneDateFormat(d.created_at) : 'N/A';
      a.updatedAt = d.updated_at ? this.utilSvc.toUnityOneDateFormat(d.updated_at) : 'N/A';
      a.space = d.space;
      a.graphData = d.graph_data;
      viewData.push(a);
    })
    return viewData;
  }
}

export class PureStorageArrayVolumeGroupViewData {
  id: string;
  name: string;
  volumes: string[];
  createdAt: string;
  updatedAt: string;
  space: PureStorageSpaceAttr;
  graphData: PureStorageGraphDataAttr;
}
