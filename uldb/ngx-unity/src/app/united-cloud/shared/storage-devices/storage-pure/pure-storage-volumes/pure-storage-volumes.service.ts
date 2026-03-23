import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { PureStorageArrayVolume, PureStorageGraphDataAttr, PureStorageSpaceAttr } from 'src/app/shared/SharedEntityTypes/storage-pure.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class PureStorageVolumesService {
  constructor(private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,) { }

  getVolumes(criteria: SearchCriteria): Observable<PaginatedResult<PureStorageArrayVolume>> {
    return this.tableService.getData<PaginatedResult<PureStorageArrayVolume>>(`customer/pure_storage/volumes/`, criteria);
  }

  convertToViewData(data: PureStorageArrayVolume[]) {
    let viewData: PureStorageArrayVolumeViewData[] = [];
    data.map(d => {
      let a = new PureStorageArrayVolumeViewData();
      a.id = d.uuid;
      a.name = d.name;
      a.serialNumber = d.serial_number ? d.serial_number : 'N/A';
      a.source = d.source ? d.source : 'N/A';
      a.hosts = d.connected_hosts && d.connected_hosts.length ? d.connected_hosts : [];
      a.hostGroups = d.connected_host_groups && d.connected_host_groups.length ? d.connected_host_groups : [];
      a.createdAt = d.created_at ? this.utilSvc.toUnityOneDateFormat(d.created_at) : 'N/A';
      a.updatedAt = d.updated_at ? this.utilSvc.toUnityOneDateFormat(d.updated_at) : 'N/A';
      a.space = d.space;
      a.graphData = d.graph_data;
      viewData.push(a);
    })
    return viewData;
  }
}

export class PureStorageArrayVolumeViewData {
  id: string;
  name: string;
  serialNumber: string;
  source: string;
  hosts: string[];
  hostGroups: string[];
  createdAt: string;
  updatedAt: string;
  space: PureStorageSpaceAttr;
  graphData: PureStorageGraphDataAttr;
}
